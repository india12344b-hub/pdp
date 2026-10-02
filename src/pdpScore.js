/**
 * PDP Score — evidence-first recruiter trust score.
 *
 * 100 points total:
 * 40  Live PDP camera capture (real-time photo/video)
 * 20  Declared original / unedited uploads (AI-free declaration)
 * 15  Evidence volume (video + photo breadth, capped)
 * 10  References / recommendations received
 * 15  Profile completeness (resume + identity + role + contact + experience)
 *
 * Important: "Original / unedited" is a candidate declaration until PDP has
 * a technical authenticity detector. It must never be presented as verified.
 */

const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export function calculatePdpScore({ media = [], intro = null, profile = {}, recommendations = [] } = {}) {
  const allMedia = Array.isArray(media) ? media : [];
  const liveMedia = allMedia.filter(item => item.captureMode === "live");
  const declaredOriginal = allMedia.filter(item => item.captureMode !== "live" && item.originalDeclared === true);

  // Career introduction is treated as live evidence only when it was captured
  // through PDP camera; an uploaded intro is not automatically considered live.
  const liveIntro = intro?.captureMode === "live" ? 1 : 0;
  const liveCount = liveMedia.length + liveIntro;

  // 40-point bucket: one live item establishes the category, then additional
  // live evidence earns diminishing credit so the score cannot be gamed by volume.
  const livePoints = 40 * (1 - Math.exp(-liveCount / 3));

  // 20-point bucket: declared original/unmodified uploaded evidence.
  // This is a declaration, not a technical verification.
  const originalCount = declaredOriginal.length;
  const originalPoints = 20 * (1 - Math.exp(-originalCount / 5));

  // 15-point bucket: breadth of evidence. Videos receive slightly more weight
  // because they contain more contextual proof, but photos also contribute.
  const videoCount = allMedia.filter(item => item.type === "video").length + (intro ? 1 : 0);
  const imageCount = allMedia.filter(item => item.type === "image").length;
  const volumeUnits = videoCount * 1.25 + imageCount;
  const volumePoints = 15 * clamp(volumeUnits / 15);

  // 10-point bucket: references/recommendations. Count is capped at 5.
  const referenceCount = Array.isArray(recommendations) ? recommendations.length : Number(recommendations) || 0;
  const referencePoints = 10 * clamp(referenceCount / 5);

  // 15-point bucket: useful recruiter-facing profile completeness.
  const fields = [
    Boolean(profile.name),
    Boolean(profile.email),
    Boolean(profile.role),
    Boolean(profile.location),
    Boolean(profile.about || profile.introduction),
    Boolean(profile.skills?.length),
    Boolean(profile.experience?.length),
    Boolean(profile.stats?.experience),
    Boolean(profile.pdpId || profile.pdpUrl),
    Boolean(profile.resumePresent),
  ];
  const completenessPoints = 15 * (fields.filter(Boolean).length / fields.length);

  const total = Math.round(clamp((livePoints + originalPoints + volumePoints + referencePoints + completenessPoints) / 100) * 100);

  return {
    total,
    livePoints: Math.round(livePoints),
    originalPoints: Math.round(originalPoints),
    volumePoints: Math.round(volumePoints),
    referencePoints: Math.round(referencePoints),
    completenessPoints: Math.round(completenessPoints),
    counts: { live: liveCount, original: originalCount, videos: videoCount, photos: imageCount, references: referenceCount },
  };
}

export function scoreLabel(score) {
  if (score >= 80) return "Strong proof profile";
  if (score >= 60) return "Good proof profile";
  if (score >= 40) return "Building proof";
  return "Getting started";
}
