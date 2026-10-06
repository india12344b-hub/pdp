/*
  PDP Media Authenticity Engine  (pdp-mae)
  Screens one image or video BEFORE it becomes proof on a PDP, and explains the result in plain language.

  Layers:   1 provenance   (live PDP-camera evidence, Content Credentials marker)
            2 metadata     (camera, software, dates, AI / editor labels written by the tool that made the file)
            3 pixels       (noise, compression, resolution heuristics — weak signals)
            4 duplicates   (exact hash + near-duplicate hash against what is already on the profile)

  Decision: "block"   the file's own metadata / Content Credentials say it is AI-generated, or it is an exact duplicate
            "review"  signals worth a human look, or no proof of origin at all → saved as Under review, no trust score
            "accept"  nothing found → tier "live" (captured with PDP camera) or "declared" (signed originality declaration)

  Honest limits (shown to users): screening lowers risk, it does not prove authenticity. A file that passes is
  "no manipulation signals found", never "verified authentic". Real proof comes from combining live capture, a signed
  declaration, screening and human review.
*/
import { readMetadata, sha256Hex } from "./authMeta";
import { toGray, dHash, hamming, noiseStd, flatRatio, elaStats, motionScore, dimsLookGenerated, dimsLookLikeScreen } from "./authForensics";

export const ENGINE = { name: "pdp-media-authenticity", version: "0.1.0" };
export const MAX_BYTES = 250 * 1024 * 1024;
/*
  STRICT_PROVENANCE
  An uploaded file with NO camera details and NO Content Credentials cannot be told apart from an AI image whose
  metadata was stripped (screenshots, chat-app forwards and re-saves all look the same). When true, such uploads are
  accepted only as "Under review" (no PDP Score credit until a person clears them, or the user captures the moment
  live). Set to false to relax this once the human-review queue exists.
*/
export const STRICT_PROVENANCE = true;
export const LIMITS_NOTE = "Screening lowers risk but cannot prove a file is authentic. It can miss high-quality AI media and can occasionally flag genuine files — that is why PDP also uses live capture, a signed declaration and human review.";

const VIRTUAL_CAM = /obs|virtual|manycam|xsplit|snap camera|splitcam|vcam|mmhmm|ndi|unity video/i;
const RELAY_CAM = /droidcam|iriun|epoccam|camo|ivcam/i;

const flag = (id, severity, title, detail) => ({ id, severity, title, detail });
const MS_DAY = 86400000;

/* ----- default (browser) deps; tests inject their own ----- */
async function defaultDeps() {
  const b = await import("./authBrowser");
  return { decodeImage: b.decodeImage, recompress: b.recompress, sampleVideo: b.sampleVideo };
}

/*
  screenMedia(file, { mode: "live" | "upload", existing: [ledger records], liveEvidence, claimedTakenOn: "YYYY-MM-DD"|null,
                      onProgress(step, pct), deps })
*/
export async function screenMedia(file, opts = {}) {
  const { mode = "upload", existing = [], liveEvidence = null, claimedTakenOn = null, onProgress = () => {} } = opts;
  const deps = opts.deps || (await defaultDeps());
  const isVideo = (file.type || "").startsWith("video/");
  const flags = [], positives = [], checks = [];
  const add = (f) => flags.push(f);
  const step = (label, pct) => { try { onProgress(label, pct); } catch {} };

  const report = {
    engine: ENGINE, ranAt: new Date().toISOString(), mode,
    file: { name: file.name, size: file.size, type: file.type, kind: isVideo ? "video" : "image", lastModified: file.lastModified || null, sha256: "", width: 0, height: 0, duration: null },
    metadata: {}, phash: "", flags, positives, checks, decision: "accept", tier: mode === "live" ? "live" : "declared", badges: [], limits: LIMITS_NOTE,
  };

  if (file.size > MAX_BYTES) {
    add(flag("too-large", "block", "File is too large to screen", `Files must be under ${Math.round(MAX_BYTES / 1048576)} MB. Trim the video or upload a smaller photo.`));
    return finish(report);
  }

  /* ---- read + hash ---- */
  step("Reading file", 8);
  const buf = await file.arrayBuffer();
  report.file.sha256 = await sha256Hex(buf);

  /* ---- 4. exact duplicate ---- */
  const dup = existing.find((r) => r?.file?.sha256 && r.file.sha256 === report.file.sha256);
  if (dup) add(flag("duplicate", "block", "Already on your profile", `This exact file was added before${dup.file?.name ? ` (${dup.file.name})` : ""}. Each piece of proof can be added once.`));
  checks.push({ id: "duplicate", label: "Duplicate check", status: dup ? "block" : "pass", detail: dup ? "Exact copy found on this profile." : "Not already on this profile." });

  /* ---- 2. metadata ---- */
  step("Reading metadata", 25);
  let meta = null;
  try { meta = await readMetadata(file, buf); } catch { meta = null; }
  if (meta) {
    report.metadata = {
      container: meta.container, camera: meta.camera, hasExif: meta.hasExif, encoder: meta.encoder || "",
      takenAt: meta.dates.original?.toISOString?.() || meta.dates.container?.toISOString?.() || null,
      contentCredentials: !!meta.c2pa, software: meta.camera?.software || meta.xmp?.creatorTool || "",
      pngTextKeys: (meta.pngTexts || []).map(([k]) => k),
    };
    const m = meta.markers;
    if (meta.c2paAi?.length) {
      add(flag("ai-content-credentials", "block", "Content Credentials say this was made with AI", `Its embedded Content Credentials (C2PA) name: ${meta.c2paAi.join(", ")}. PDP evidence must be genuine work. If this is a mistake, capture it live with the PDP camera instead.`));
    }
    if (m.ai.length) {
      add(flag("ai-label", "block", "File is labelled as AI-generated", `Its own metadata names: ${[...new Set(m.ai)].join(", ")}. PDP evidence must be genuine work. If this is a mistake, capture it live with the PDP camera instead.`));
    }
    if (m.aiWeak.length) add(flag("ai-tool-name", "review", "Mentions an AI media tool", `Metadata mentions ${[...new Set(m.aiWeak)].join(", ")}. A person will take a look before this counts toward your PDP Score.`));
    if (m.editors.length || meta.photoshopBlock) add(flag("edited-software", "review", "Edited with image-editing software", `Metadata shows ${[...new Set(m.editors)].join(", ") || "Adobe Photoshop"}. Edits that change what a photo shows are not allowed; a person will take a look.`));
    if (m.editorsInfo.length && !m.editors.length) add(flag("edited-basic", "info", "Basic editing tool used", `Metadata shows ${[...new Set(m.editorsInfo)].join(", ")} — normal for trimming, cropping or colour correction.`));

    const cam = meta.camera;
    const hasCam = !!(cam && (cam.make || cam.model));
    if (hasCam) { positives.push(`Camera details present: ${[cam.make, cam.model].filter(Boolean).join(" ")}`); report.badges.push("camera-metadata"); }
    if (meta.c2pa && !meta.c2paAi?.length) { positives.push("Content Credentials (C2PA) present, with no AI statement — not cryptographically validated yet"); report.badges.push("content-credentials"); }
    checks.push({ id: "metadata", label: "Metadata", status: m.ai.length ? "block" : m.aiWeak.length || m.editors.length ? "review" : hasCam || meta.c2pa ? "pass" : "info",
      detail: m.ai.length ? "Labelled as AI-generated." : hasCam ? `Camera details found (${[cam.make, cam.model].filter(Boolean).join(" ")}).` : "Little or no camera metadata (common when files are shared via chat apps)." });

    // dates
    const taken = meta.dates.original || meta.dates.container;
    if (taken) {
      if (taken.getTime() > Date.now() + MS_DAY) add(flag("future-date", "review", "Date is in the future", "The file says it was taken after today, which usually means its clock or metadata is wrong."));
      if (claimedTakenOn) {
        const claimed = new Date(claimedTakenOn);
        if (!Number.isNaN(claimed.getTime()) && Math.abs(claimed - taken) > 45 * MS_DAY) add(flag("date-mismatch", "review", "Date you gave differs from the file", `You said ${claimedTakenOn}; the file says ${taken.toISOString().slice(0, 10)}.`));
      }
    }
    if (isVideo && meta.encoder && /sora|runway|pika|kling|luma|veo|synthesia|heygen|d-id/i.test(meta.encoder)) add(flag("ai-video-encoder", "review", "Video encoder looks like an AI tool", `Encoder tag: ${meta.encoder}.`));
  } else checks.push({ id: "metadata", label: "Metadata", status: "info", detail: "Could not read metadata." });

  /* ---- 3. pixels ---- */
  step(isVideo ? "Sampling video frames" : "Analysing image", 50);
  let natural = { w: meta?.width || 0, h: meta?.height || 0 };
  try {
    if (!isVideo) {
      const img = await deps.decodeImage(file, 512);
      natural = { w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
      report.file.width = natural.w; report.file.height = natural.h;
      const gray = toGray(img);
      report.phash = dHash(gray);
      const noise = noiseStd(gray), flat = flatRatio(gray);
      let ela = null;
      if (meta?.container === "jpeg" && deps.recompress) { try { const re = await deps.recompress(img); if (re) ela = elaStats(img, re); } catch {} }
      report.metadata.pixels = { noise: +noise.toFixed(2), flat: +flat.toFixed(2), ela: ela ? { mean: +ela.mean.toFixed(2), ratio: +ela.ratio.toFixed(1) } : null };

      const cam = meta?.camera, hasCam = !!(cam && (cam.make || cam.model));
      const px = [];
      if (!hasCam && dimsLookGenerated(natural.w, natural.h)) {
        const smooth = noise < 0.9 && flat < 0.6;
        add(flag("synthetic-look", "review", "Looks like a generated image", `Size ${natural.w}×${natural.h} is a size AI image tools commonly produce${smooth ? ", the texture is unusually smooth" : ""}, and there are no camera details. Graphics and screenshots can look like this too.`));
        px.push("review");
      }
      if (ela && ela.ratio > 16 && ela.mean > 1.5) { add(flag("compression-inconsistent", "review", "Uneven compression in parts of the image", "Some regions behave differently from the rest, which can happen when parts of an image are pasted in.")); px.push("review"); }
      else if (ela && ela.ratio > 9 && ela.mean > 1.5) { add(flag("compression-uneven", "info", "Slightly uneven compression", "Weak signal on its own; noted for reviewers.")); }
      if (!hasCam && (/screen[ _-]?shot|screen[ _-]?record/i.test(file.name) || (meta?.container === "png" && dimsLookLikeScreen(natural.w, natural.h)))) add(flag("screenshot", "info", "Looks like a screenshot", "Screenshots of dashboards or documents are fine, but PDP trusts real work photos and live capture more."));
      checks.push({ id: "pixels", label: "Manipulation signals", status: px.length ? "review" : "pass", detail: px.length ? "Some pixel-level patterns worth a human look." : "No unusual pixel patterns found (a weak check)." });

      // near-duplicate
      const near = existing.find((r) => r?.file?.phash && hamming(r.file.phash, report.phash) <= 4 && r.file.sha256 !== report.file.sha256);
      if (near) add(flag("near-duplicate", "info", "Very similar to another item", `Looks almost the same as ${near.file?.name || "an item already on your profile"}.`));
    } else {
      const v = await deps.sampleVideo(file, 4, 256);
      report.file.width = v.width; report.file.height = v.height; report.file.duration = v.duration;
      natural = { w: v.width, h: v.height };
      const grays = v.frames.map((f) => f.gray);
      if (grays[0]) report.phash = dHash(grays[0]);
      let motion = 0;
      for (let i = 1; i < grays.length; i++) motion = Math.max(motion, motionScore(grays[i - 1], grays[i]));
      const noise = grays.length ? grays.reduce((s, g) => s + noiseStd(g), 0) / grays.length : 0;
      report.metadata.pixels = { noise: +noise.toFixed(2), motion: +motion.toFixed(2), frames: grays.length };
      if (grays.length > 1 && motion < 0.35) add(flag("static-video", "info", "Almost no movement in the video", "It looks like a still image or a very still scene. Fine for a presentation; noted for reviewers."));
      if (v.duration && v.duration > 600) add(flag("long-video", "info", "Long video", "Short clips (about 20–45 seconds) work best for proof."));
      checks.push({ id: "pixels", label: "Manipulation signals", status: "pass", detail: `Sampled ${grays.length} frame${grays.length === 1 ? "" : "s"}; no unusual patterns (a weak check).` });
    }
  } catch {
    checks.push({ id: "pixels", label: "Manipulation signals", status: "info", detail: "This browser could not decode the file for pixel checks; metadata checks still ran." });
  }

  /* ---- provenance of an upload: where does this file say it came from? ---- */
  if (mode === "upload") {
    const cam = meta?.camera;
    const hasCam = !!(cam && (cam.make || cam.model));
    const hasCreds = !!(meta?.c2pa && !meta?.c2paAi?.length);
    if (STRICT_PROVENANCE && !hasCam && !hasCreds && !flags.some((f) => f.severity === "block")) {
      add(flag("no-provenance", "review", "No proof of where this file came from", `The file has no camera details and no Content Credentials. That is normal for screenshots and photos forwarded on chat apps — but an AI-generated image looks exactly the same, so PDP can't accept it automatically. It will be reviewed. For instant trust, capture the moment live with the PDP camera.`));
    }
    checks.push({ id: "origin", label: "Proof of origin", status: hasCam || hasCreds ? "pass" : STRICT_PROVENANCE ? "review" : "info",
      detail: hasCam ? `Camera details found (${[cam.make, cam.model].filter(Boolean).join(" ")}).` : hasCreds ? "Content Credentials found, with no AI statement." : "No camera details or Content Credentials in this file." });
  }

  /* ---- 1. provenance ---- */
  step("Checking provenance", 80);
  if (mode === "live") {
    const ev = liveEvidence || {};
    const label = ev.device?.label || "";
    if (!liveEvidence) add(flag("no-live-evidence", "review", "Live capture details are missing", "PDP could not confirm this came from the PDP camera session."));
    else {
      if (VIRTUAL_CAM.test(label)) add(flag("virtual-camera", "review", "Virtual camera detected", `The camera is named “${label}”. Virtual cameras can show pre-made video, so a person will take a look.`));
      else if (RELAY_CAM.test(label)) add(flag("relay-camera", "review", "Phone-as-webcam app detected", `The camera is named “${label}”. This is often legitimate, but PDP cannot verify it automatically.`));
      else positives.push(`Captured live through the PDP camera${label ? ` (${label})` : ""}`);
      if (typeof ev.motionScore === "number" && ev.motionScore < 0.2 && !isVideo) add(flag("frozen-feed", "info", "Camera feed looked frozen", "The preview showed no change before capture. Noted for reviewers."));
    }
    checks.push({ id: "provenance", label: "Live capture", status: flags.some((f) => ["virtual-camera", "relay-camera", "no-live-evidence"].includes(f.id)) ? "review" : "pass", detail: liveEvidence ? "Captured through a live PDP camera session." : "No live session details." });
  } else {
    checks.push({ id: "provenance", label: "Source", status: "info", detail: "Uploaded existing file — relies on your signed declaration and the checks above." });
  }
  step("Done", 100);
  return finish(report);
}

function finish(report) {
  const sev = (s) => report.flags.some((f) => f.severity === s);
  report.decision = sev("block") ? "block" : sev("review") ? "review" : "accept";
  report.tier = report.decision === "review" ? "review" : report.mode === "live" ? "live" : "declared";
  return report;
}

/* Plain-language headline for a report */
export function headline(report) {
  if (report.decision === "block") return { tone: "block", en: "This file can't be added", hi: "Ye file add nahi ho sakti" };
  if (report.decision === "review") return { tone: "review", en: "Can be added, but will be reviewed", hi: "Add ho sakti hai, par review hogi" };
  return { tone: "pass", en: "No manipulation signals found", hi: "Koi manipulation signal nahi mila" };
}
