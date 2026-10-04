/* PDP Media Authenticity Engine — browser helpers (canvas / video decoding). Not used in tests; the engine accepts replacements. */
import { toGray } from "./authForensics";

const canvasFor = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

export async function decodeImage(file, maxSide = 512) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.max(8, Math.round(bmp.width * scale)), h = Math.max(8, Math.round(bmp.height * scale));
  const c = canvasFor(w, h), ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, w, h);
  const out = { ...ctx.getImageData(0, 0, w, h), naturalWidth: bmp.width, naturalHeight: bmp.height };
  bmp.close?.();
  return { data: out.data, width: w, height: h, naturalWidth: out.naturalWidth, naturalHeight: out.naturalHeight };
}

/* re-compress an ImageData-like at JPEG 90 and read it back (for ELA) */
export async function recompress(img) {
  const c = canvasFor(img.width, img.height), ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.putImageData(new ImageData(new Uint8ClampedArray(img.data), img.width, img.height), 0, 0);
  const blob = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.9));
  if (!blob) return null;
  const bmp = await createImageBitmap(blob);
  const c2 = canvasFor(img.width, img.height), ctx2 = c2.getContext("2d", { willReadFrequently: true });
  ctx2.drawImage(bmp, 0, 0);
  bmp.close?.();
  const d = ctx2.getImageData(0, 0, img.width, img.height);
  return { data: d.data, width: img.width, height: img.height };
}

/* sample up to n frames from a video file → { frames: [gray…], duration, width, height } */
export async function sampleVideo(file, n = 4, side = 256) {
  const url = URL.createObjectURL(file);
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
  try {
    await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = () => rej(new Error("video")); setTimeout(() => rej(new Error("timeout")), 8000); });
    let dur = v.duration;
    if (!isFinite(dur) || dur <= 0) { // MediaRecorder WebM often reports Infinity until seeked to the end
      v.currentTime = 1e6;
      await new Promise((res) => { v.ontimeupdate = () => { v.ontimeupdate = null; res(); }; setTimeout(res, 3000); });
      dur = v.duration;
      v.currentTime = 0;
    }
    const scale = Math.min(1, side / Math.max(v.videoWidth, v.videoHeight));
    const w = Math.max(8, Math.round(v.videoWidth * scale)), h = Math.max(8, Math.round(v.videoHeight * scale));
    const c = canvasFor(w, h), ctx = c.getContext("2d", { willReadFrequently: true });
    const frames = [];
    const count = isFinite(dur) && dur > 0.6 ? n : 1;
    for (let i = 0; i < count; i++) {
      const t = isFinite(dur) && dur > 0.6 ? (dur * (i + 0.5)) / count : 0;
      v.currentTime = t;
      await new Promise((res) => { v.onseeked = res; setTimeout(res, 1500); });
      ctx.drawImage(v, 0, 0, w, h);
      const d = ctx.getImageData(0, 0, w, h);
      frames.push({ gray: toGray({ data: d.data, width: w, height: h }), img: { data: d.data, width: w, height: h } });
    }
    return { frames, duration: isFinite(dur) ? dur : null, width: v.videoWidth, height: v.videoHeight };
  } finally { URL.revokeObjectURL(url); v.removeAttribute("src"); v.load?.(); }
}
