/*
  PDP Media Authenticity Engine — metadata layer.
  Reads what a file says about itself: EXIF (camera, software, dates), XMP, PNG text chunks, C2PA / Content
  Credentials markers, MP4/MOV/WebM container tags. No libraries, nothing leaves the browser.

  IMPORTANT: AI markers are only searched inside real metadata regions (never in raw pixel data), so random
  bytes in an image can never trigger a false match.
*/

const latin1 = (u8) => { let s = ""; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return s; };
const utf8 = (u8) => new TextDecoder("utf-8", { fatal: false }).decode(u8);
const startsWith = (u8, str) => { for (let i = 0; i < str.length; i++) if (u8[i] !== str.charCodeAt(i)) return false; return true; };

export async function sha256Hex(buf) {
  const h = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ASCII strings (>= 4 chars) found in a byte region — used to search binary metadata boxes safely. */
export function printable(u8) {
  const out = []; let cur = "";
  for (let i = 0; i < u8.length; i++) {
    const b = u8[i];
    if (b >= 32 && b < 127) cur += String.fromCharCode(b);
    else { if (cur.length >= 4) out.push(cur); cur = ""; }
  }
  if (cur.length >= 4) out.push(cur);
  return out.join("\n");
}

export function sniffContainer(u8) {
  if (u8[0] === 0xff && u8[1] === 0xd8) return "jpeg";
  if (u8[0] === 0x89 && startsWith(u8.subarray(1), "PNG")) return "png";
  if (startsWith(u8, "RIFF") && startsWith(u8.subarray(8), "WEBP")) return "webp";
  if (startsWith(u8, "GIF8")) return "gif";
  if (u8[0] === 0x1a && u8[1] === 0x45 && u8[2] === 0xdf && u8[3] === 0xa3) return "webm";
  if (startsWith(u8.subarray(4), "ftyp")) { const brand = latin1(u8.subarray(8, 12)); return /^(heic|heix|hevc|mif1|msf1)/.test(brand) ? "heic" : brand.startsWith("qt") ? "mov" : "mp4"; }
  return "unknown";
}

/* ---------- TIFF / EXIF ---------- */
export function parseTiff(t) {
  if (!t || t.length < 8) return null;
  const le = t[0] === 0x49;
  const dv = new DataView(t.buffer, t.byteOffset, t.byteLength);
  const u16 = (o) => dv.getUint16(o, le), u32 = (o) => dv.getUint32(o, le);
  if (u16(2) !== 42) return null;
  const SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1 };
  const str = (off, n) => { let s = ""; for (let k = 0; k < n && off + k < t.length; k++) { const c = t[off + k]; if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
  const out = {};
  const ifd = (off, cb) => {
    if (off + 2 > t.length) return;
    const n = u16(off);
    for (let k = 0; k < n; k++) {
      const e = off + 2 + k * 12;
      if (e + 12 > t.length) break;
      const tag = u16(e), type = u16(e + 2), count = u32(e + 4);
      const size = (SIZE[type] || 1) * count;
      const val = size <= 4 ? e + 8 : u32(e + 8);
      if (val >= t.length && size > 4) continue;
      cb(tag, type, count, val);
    }
  };
  ifd(u32(4), (tag, type, count, val) => {
    if (tag === 0x010f) out.make = str(val, count);
    else if (tag === 0x0110) out.model = str(val, count);
    else if (tag === 0x0131) out.software = str(val, count);
    else if (tag === 0x0132) out.dateTime = str(val, count);
    else if (tag === 0x0112) out.orientation = u16(val);
    else if (tag === 0x8769) {
      ifd(u32(val), (t2, ty2, c2, v2) => {
        if (t2 === 0x9003) out.dateTimeOriginal = str(v2, c2);
        else if (t2 === 0x9004) out.dateTimeDigitized = str(v2, c2);
        else if (t2 === 0xa434) out.lens = str(v2, c2);
        else if (t2 === 0x927c) out.hasMakerNote = true;
        else if (t2 === 0xa431) out.hasBodySerial = true;
        else if (t2 === 0xa300) out.fileSource = t[v2];
        else if (t2 === 0x9286 && c2 > 8) out.userComment = str(v2 + 8, c2 - 8);
      });
    } else if (tag === 0x8825) out.hasGps = true;
  });
  return out;
}

/* "2024:03:09 14:22:10" → Date (local time, as cameras write it) */
export function exifDate(s) {
  const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(s || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : null;
}

/* ---------- XMP ---------- */
export function parseXmp(text) {
  if (!text) return null;
  const pick = (re) => { const m = re.exec(text); return m ? (m[1] || m[2] || "").trim() : ""; };
  return {
    text,
    creatorTool: pick(/xmp:CreatorTool="([^"]*)"|<xmp:CreatorTool>([^<]*)</i),
    digitalSourceType: pick(/DigitalSourceType(?:="|>)\s*([^"<\s]*)/i),
    softwareAgents: [...text.matchAll(/stEvt:softwareAgent="([^"]*)"/g)].map((m) => m[1]),
    dateCreated: pick(/photoshop:DateCreated="([^"]*)"|<photoshop:DateCreated>([^<]*)</i),
  };
}

/* ---------- containers ---------- */
function parseJpeg(u8) {
  const r = { exif: null, xmp: [], jumbf: [], comments: [], photoshop: false };
  let i = 2;
  while (i < u8.length - 4) {
    if (u8[i] !== 0xff) { i++; continue; }
    const m = u8[i + 1];
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01 || m === 0xff) { i += m === 0xff ? 1 : 2; continue; }
    if (m === 0xda || m === 0xd9) break;
    const len = (u8[i + 2] << 8) | u8[i + 3];
    if (len < 2) break;
    const seg = u8.subarray(i + 4, i + 2 + len);
    if (m === 0xe1) {
      if (startsWith(seg, "Exif\0\0")) r.exif = seg.subarray(6);
      else if (startsWith(seg, "http://ns.adobe.com/xap/1.0/\0")) r.xmp.push(utf8(seg.subarray(29)));
    } else if (m === 0xeb) r.jumbf.push(seg);
    else if (m === 0xed && startsWith(seg, "Photoshop 3.0")) r.photoshop = true;
    else if (m === 0xfe) r.comments.push(latin1(seg));
    i += 2 + len;
  }
  return r;
}

function parsePng(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const r = { texts: [], exif: null, c2pa: false, c2paText: "", width: 0, height: 0 };
  let i = 8;
  while (i + 12 <= u8.length) {
    const len = dv.getUint32(i);
    const type = latin1(u8.subarray(i + 4, i + 8));
    const data = u8.subarray(i + 8, Math.min(i + 8 + len, u8.length));
    if (type === "IHDR") { r.width = dv.getUint32(i + 8); r.height = dv.getUint32(i + 12); }
    else if (type === "tEXt") { const z = data.indexOf(0); if (z > 0) r.texts.push([latin1(data.subarray(0, z)), latin1(data.subarray(z + 1))]); }
    else if (type === "iTXt") {
      const z = data.indexOf(0);
      if (z > 0) {
        const comp = data[z + 1];
        let p = data.indexOf(0, z + 3) + 1; p = data.indexOf(0, p) + 1;
        r.texts.push([latin1(data.subarray(0, z)), comp ? "(compressed)" : utf8(data.subarray(p))]);
      }
    } else if (type === "zTXt") { const z = data.indexOf(0); if (z > 0) r.texts.push([latin1(data.subarray(0, z)), "(compressed)"]); }
    else if (type === "eXIf") r.exif = data;
    else if (type === "caBX") { r.c2pa = true; r.c2paText += printable(data) + "\n"; }
    if (type === "IEND") break;
    i += 12 + len;
  }
  return r;
}

function parseWebp(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const r = { exif: null, xmp: [], c2pa: false, c2paText: "" };
  let i = 12;
  while (i + 8 <= u8.length) {
    const type = latin1(u8.subarray(i, i + 4));
    const size = dv.getUint32(i + 4, true);
    const data = u8.subarray(i + 8, i + 8 + size);
    if (type === "EXIF") r.exif = startsWith(data, "Exif\0\0") ? data.subarray(6) : data;
    else if (type === "XMP ") r.xmp.push(utf8(data));
    else if (type === "C2PA") { r.c2pa = true; r.c2paText += printable(data) + "\n"; }
    i += 8 + size + (size % 2);
  }
  return r;
}

/* MP4 / MOV: walk top-level boxes with Blob slices, so even large videos are cheap to inspect. */
async function parseMp4(file) {
  const r = { strings: "", creation: null, c2pa: false, c2paText: "" };
  const head = async (off, n) => new Uint8Array(await file.slice(off, off + n).arrayBuffer());
  let off = 0, guard = 0;
  while (off + 8 <= file.size && guard++ < 200) {
    try { // a damaged box must never throw away what was already read
      const h = await head(off, 16);
      const dv = new DataView(h.buffer);
      let size = dv.getUint32(0);
      const type = latin1(h.subarray(4, 8));
      let hdr = 8;
      if (size === 1 && h.length >= 16) { size = Number(dv.getBigUint64(8)); hdr = 16; }
      if (size === 0) size = file.size - off;
      if (size < hdr) break;
      if (type === "moov" && size < 8 * 1024 * 1024) {
        const body = await head(off + hdr, size - hdr);
        r.strings += printable(body) + "\n";
        try {
          const k = latin1(body).indexOf("mvhd");
          if (k >= 0 && k + 16 <= body.length) {
            const v = body[k + 4], d = new DataView(body.buffer, body.byteOffset);
            const secs = v === 1 ? Number(d.getBigUint64(k + 8)) : d.getUint32(k + 8);
            if (secs > 0) r.creation = new Date((secs - 2082844800) * 1000);
          }
        } catch {}
      } else if (type === "uuid") {
        const u = await head(off + hdr, 16);
        const hex = [...u].map((b) => b.toString(16).padStart(2, "0")).join("");
        if (latin1(u).includes("c2pa") || hex.startsWith("d8fec3d61b0e483c92975828877ec481")) {
          r.c2pa = true;
          if (size < 4 * 1024 * 1024) r.c2paText += printable(await head(off + hdr + 16, size - hdr - 16)) + "\n";
        }
      }
      off += size;
    } catch { break; }
  }
  return r;
}

/* ---------- marker dictionaries ---------- */
// BLOCK: the file itself says it is AI-generated.
const AI_BLOCK = [
  [/trainedalgorithmicmedia|compositewithtrainedalgorithmicmedia|digitalsourcetype\/algorithmicmedia|compositesynthetic/i, "IPTC “AI-generated” label"],
  [/midjourney/i, "Midjourney"], [/dall[-·. ]?e\b/i, "DALL·E"], [/stable[ -]?diffusion|stability\.ai/i, "Stable Diffusion"],
  [/comfyui/i, "ComfyUI"], [/automatic1111|sd-webui|\bsampler:\s*\w+/i, "Stable Diffusion WebUI"], [/invokeai/i, "InvokeAI"],
  [/firefly|generative ?fill|generative ?expand/i, "Adobe Firefly / Generative Fill"], [/synthid|made with google ai/i, "Google AI (SynthID)"],
  [/leonardo\.ai/i, "Leonardo AI"], [/ideogram/i, "Ideogram"], [/synthesia/i, "Synthesia"], [/heygen/i, "HeyGen"],
  [/openai/i, "OpenAI (Content Credentials)"], [/chatgpt|gpt[-_ ]?image|gpt[-_ ]?4o/i, "ChatGPT image generation"],
  [/bing image creator|microsoft designer|dreamstudio|clipdrop|playground ?ai|krea\.ai|imagined with meta|meta ai|\bgrok\b/i, "AI image service"],
  [/canva magic|ai (image )?generator|text[- ]to[- ](image|video)/i, "AI generator"],
];
// REVIEW: AI-video / image tools whose names are short or ambiguous, and editors that can change what a photo shows.
const AI_WEAK = [[/\bgemini\b/i, "Gemini"], [/\bsora\b/i, "Sora"], [/\brunway(ml)?\b/i, "Runway"], [/\bpika\b/i, "Pika"], [/\bkling\b/i, "Kling"], [/luma (ai|dream)|lumalabs/i, "Luma"], [/\bveo\b/i, "Veo"], [/\bimagen\b/i, "Imagen"], [/flux\.1|black forest labs/i, "FLUX"], [/\bd-id\b/i, "D-ID"], [/craiyon|nightcafe/i, "AI image site"]];
const EDITORS_REVIEW = [[/photoshop/i, "Adobe Photoshop"], [/\bgimp\b/i, "GIMP"], [/canva/i, "Canva"], [/pixlr/i, "Pixlr"], [/photopea/i, "Photopea"], [/picsart/i, "Picsart"], [/facetune/i, "Facetune"], [/faceapp/i, "FaceApp"], [/remini/i, "Remini"], [/meitu|beautycam|b612/i, "Beauty editor"]];
const EDITORS_INFO = [[/lightroom/i, "Adobe Lightroom"], [/snapseed/i, "Snapseed"], [/premiere/i, "Adobe Premiere"], [/capcut/i, "CapCut"], [/final cut/i, "Final Cut"], [/davinci/i, "DaVinci Resolve"], [/lavf|ffmpeg/i, "FFmpeg"]];

/* Inside a Content Credentials (C2PA) manifest any AI-tool name is a real statement, not a hint — treat weak names as AI too. */
export function scanProvenance(text) {
  const m = scanMarkers(text);
  return [...new Set([...m.ai, ...m.aiWeak])];
}

export function scanMarkers(text) {
  const t = String(text || "");
  const hit = (list) => list.filter(([re]) => re.test(t)).map(([, label]) => label);
  return { ai: hit(AI_BLOCK), aiWeak: hit(AI_WEAK), editors: hit(EDITORS_REVIEW), editorsInfo: hit(EDITORS_INFO) };
}

/* ---------- main entry ---------- */
/* readMetadata(file, buf) → { container, camera, dates, regionsText, markers, c2pa, notes, width?, height? } */
export async function readMetadata(file, buf) {
  const u8 = new Uint8Array(buf);
  const container = sniffContainer(u8);
  const out = { container, camera: null, dates: {}, c2pa: false, xmp: null, pngTexts: [], encoder: "", regionsText: "", hasExif: false, photoshopBlock: false };
  const text = [];
  const c2paText = []; // text found inside Content Credentials manifests
  let exifBytes = null;

  try {
    if (container === "jpeg") {
      const j = parseJpeg(u8);
      exifBytes = j.exif;
      j.xmp.forEach((x) => { out.xmp = parseXmp(x); text.push(x); });
      j.comments.forEach((c) => text.push(c));
      j.jumbf.forEach((s) => { const p = printable(s); text.push(p); c2paText.push(p); if (/c2pa|jumb/i.test(latin1(s).slice(0, 64)) || /c2pa/i.test(p)) out.c2pa = true; });
      out.photoshopBlock = j.photoshop;
    } else if (container === "png") {
      const p = parsePng(u8);
      exifBytes = p.exif; out.c2pa = p.c2pa; if (p.c2paText) { text.push(p.c2paText); c2paText.push(p.c2paText); } out.pngTexts = p.texts; out.width = p.width; out.height = p.height;
      p.texts.forEach(([k, v]) => { text.push(`${k}: ${v}`); if (/^XML:com\.adobe\.xmp$/i.test(k)) out.xmp = parseXmp(v); });
    } else if (container === "webp") {
      const w = parseWebp(u8);
      exifBytes = w.exif; w.xmp.forEach((x) => { out.xmp = parseXmp(x); text.push(x); });
      if (w.c2pa) { out.c2pa = true; text.push(w.c2paText); c2paText.push(w.c2paText); }
    } else if (container === "mp4" || container === "mov" || container === "heic") {
      const m = await parseMp4(file);
      text.push(m.strings); out.c2pa = m.c2pa; if (m.c2paText) { text.push(m.c2paText); c2paText.push(m.c2paText); }
      if (m.creation) out.dates.container = m.creation;
      const enc = /(?:©too|encoder|writing[ -]?app|com\.apple\.quicktime\.software|Lavf\S*|HandBrake\S*)[^\n]{0,60}/i.exec(m.strings);
      if (enc) out.encoder = enc[0].trim();
      const make = /com\.apple\.quicktime\.make\W*([A-Za-z]+)/.exec(m.strings), model = /com\.apple\.quicktime\.model\W*([\w ]+)/.exec(m.strings);
      if (make || model) out.camera = { make: make?.[1] || "", model: (model?.[1] || "").trim() };
    } else if (container === "webm") {
      const s = printable(u8.subarray(0, Math.min(u8.length, 8192)));
      text.push(s);
      const enc = /(Lavf\S*|libwebm\S*|Chrome\S*|Firefox\S*|MediaRecorder\S*)/i.exec(s);
      if (enc) out.encoder = enc[0];
    }
  } catch { /* a malformed file must never crash screening; whatever was read so far is kept */ }

  if (exifBytes) {
    try {
      const x = parseTiff(exifBytes);
      if (x) {
        out.hasExif = true;
        out.camera = { make: x.make || "", model: x.model || "", lens: x.lens || "", software: x.software || "", hasMakerNote: !!x.hasMakerNote, hasGps: !!x.hasGps, hasBodySerial: !!x.hasBodySerial, fileSource: x.fileSource };
        if (x.dateTimeOriginal) out.dates.original = exifDate(x.dateTimeOriginal);
        if (x.dateTime) out.dates.modified = exifDate(x.dateTime);
        [x.software, x.userComment, x.make, x.model].filter(Boolean).forEach((s) => text.push(s));
      }
    } catch {}
  }
  if (out.xmp) { if (out.xmp.creatorTool) text.push(out.xmp.creatorTool); }

  out.regionsText = text.join("\n");
  out.markers = scanMarkers(out.regionsText + (out.xmp?.digitalSourceType ? `\n${out.xmp.digitalSourceType}` : ""));
  out.c2paAi = out.c2pa ? scanProvenance(c2paText.join("\n")) : []; // AI statements inside Content Credentials (contents are read, not cryptographically validated yet)
  return out;
}
