/*
  PDP Media Authenticity Engine — pixel layer.
  Light, honest heuristics on decoded pixels. Pure functions over { data: RGBA array, width, height }, so they run
  (and are tested) without a browser.

  These are WEAK signals. They can miss good AI images and can flag genuine ones, so the engine never reports them
  as "AI detected" — they only raise a "needs review" flag, and only in combination.
*/

export function toGray(img) {
  const { data, width, height } = img;
  const g = new Float32Array(width * height);
  for (let i = 0, p = 0; i < g.length; i++, p += 4) g[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  return { g, width, height };
}

/* area-average resize of a gray image */
export function resizeGray({ g, width, height }, w, h) {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor((y * height) / h), y1 = Math.max(y0 + 1, Math.floor(((y + 1) * height) / h));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor((x * width) / w), x1 = Math.max(x0 + 1, Math.floor(((x + 1) * width) / w));
      let s = 0, n = 0;
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { s += g[yy * width + xx]; n++; }
      out[y * w + x] = s / n;
    }
  }
  return { g: out, width: w, height: h };
}

/* 64-bit difference hash (hex). Near-duplicates have a small Hamming distance. */
export function dHash(gray) {
  const s = resizeGray(gray, 9, 8);
  let bits = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += s.g[y * 9 + x] > s.g[y * 9 + x + 1] ? "1" : "0";
  let hex = "";
  for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}
export function hamming(a, b) {
  if (!a || !b || a.length !== b.length) return 64;
  let d = 0;
  for (let i = 0; i < a.length; i++) { let x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { d += x & 1; x >>= 1; } }
  return d;
}

/* High-frequency residual (pixel minus 3x3 average). Real camera sensors leave noise; some synthetic images are unusually smooth. */
export function noiseStd(gray) {
  const { g, width: w, height: h } = gray;
  let s = 0, s2 = 0, n = 0;
  for (let y = 1; y < h - 1; y += 2) for (let x = 1; x < w - 1; x += 2) {
    let m = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) m += g[(y + dy) * w + x + dx];
    const r = g[y * w + x] - m / 9;
    s += r; s2 += r * r; n++;
  }
  if (!n) return 0;
  const mean = s / n;
  return Math.sqrt(Math.max(0, s2 / n - mean * mean));
}

/* share of 8x8 blocks that are perfectly flat (graphics, screenshots, flat renders) */
export function flatRatio(gray) {
  const { g, width: w, height: h } = gray;
  let flat = 0, total = 0;
  for (let by = 0; by + 8 <= h; by += 8) for (let bx = 0; bx + 8 <= w; bx += 8) {
    let mn = 255, mx = 0;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = g[(by + y) * w + bx + x]; if (v < mn) mn = v; if (v > mx) mx = v; }
    total++; if (mx - mn < 2) flat++;
  }
  return total ? flat / total : 0;
}

/* Error Level Analysis: compare the image with a re-compressed copy. Localised, strong differences can indicate pasted regions. */
export function elaStats(a, b) {
  const { width: w, height: h } = a;
  if (b.width !== w || b.height !== h) return null;
  const errs = [];
  for (let by = 0; by + 8 <= h; by += 8) for (let bx = 0; bx + 8 <= w; bx += 8) {
    let s = 0;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const p = ((by + y) * w + bx + x) * 4;
      s += Math.abs(a.data[p] - b.data[p]) + Math.abs(a.data[p + 1] - b.data[p + 1]) + Math.abs(a.data[p + 2] - b.data[p + 2]);
    }
    errs.push(s / 192);
  }
  if (!errs.length) return null;
  const sorted = [...errs].sort((x, y) => x - y);
  const mean = errs.reduce((x, y) => x + y, 0) / errs.length;
  const med = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  return { mean, med, p95, ratio: p95 / Math.max(med, 0.25) };
}

/* mean absolute difference between two frames (after shrinking) — is the scene actually changing? */
export function motionScore(grayA, grayB) {
  const a = resizeGray(grayA, 32, 32).g, b = resizeGray(grayB, 32, 32).g;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
}

/* Resolutions typical of AI image generators (DALL·E / ChatGPT, Midjourney, Gemini/Imagen, Stable Diffusion, FLUX, Ideogram…). */
const GEN_SQUARE = [512, 640, 768, 832, 1024, 1280, 1536, 2048, 4096];
const GEN_PAIRS = new Set(["1344x768", "1024x1792", "1792x1024", "1216x832", "1152x896", "1024x1536", "1536x1024", "1344x896", "1408x768", "1456x816", "1472x832", "1184x864", "1248x832", "1568x672", "1792x768", "1920x1088", "1280x768", "1280x704", "960x544", "1152x768", "1280x896", "2048x1152", "1664x928", "2752x1536", "1536x1536"]);
export function dimsLookGenerated(w, h) {
  if (!w || !h) return false;
  if (w === h && GEN_SQUARE.includes(w)) return true;
  if (GEN_PAIRS.has(`${w}x${h}`) || GEN_PAIRS.has(`${h}x${w}`)) return true;
  return w >= 512 && h >= 512 && w % 64 === 0 && h % 64 === 0; // both sides multiples of 64: typical of diffusion models, rare for cameras
}

const SCREEN_DIMS = ["1080x1920", "1170x2532", "1284x2778", "1179x2556", "1290x2796", "1440x3200", "1080x2400", "1080x2340", "1920x1080", "2560x1440", "3840x2160", "1366x768", "1440x900", "2880x1800"];
export const dimsLookLikeScreen = (w, h) => SCREEN_DIMS.includes(`${w}x${h}`) || SCREEN_DIMS.includes(`${h}x${w}`);
