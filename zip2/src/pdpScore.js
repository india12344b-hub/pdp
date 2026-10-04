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
 * Authenticity tiers (from the Media Authenticity Engine, ../auth):
 *   live      captured with the PDP camera                         → full credit in the Live bucket
 *   declared  uploaded + signed declaration + screening passed     → full credit in the Original bucket
 *   legacy    added before screening existed (old checkbox only)   → half credit
 *   review    screening flagged something; a person must look      → no trust credit until cleared
 *
 * Important: "Original / unedited" is a candidate declaration plus screening — it is NOT verification.
 * Screening lowers risk; it can never prove a file is authentic. Do not present it as verified.
 */

export const tierKey = (item) => {
  if (!item) return null;
  if (item.authTier) return item.authTier;                       // set by the engine
  if (item.captureMode === "live") return "live";                // captured live before the engine existed
  if (item.originalDeclared === true) return "legacy";           // old declaration checkbox only
  return "none";
};

const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export function calculatePdpScore({ media = [], intro = null, profile = {}, recommendations = [] } = {}) {
  const allMedia = Array.isArray(media) ? media : [];
  const count = (key) => allMedia.filter(item => tierKey(item) === key).length;

  // The career introduction counts like any other piece of evidence, by its tier.
  const introTier = intro ? tierKey(intro) : null;
  const liveCount = count("live") + (introTier === "live" ? 1 : 0);
  const declaredCount = count("declared") + (introTier === "declared" ? 1 : 0);
  const legacyCount = count("legacy") + (introTier === "legacy" ? 1 : 0);
  const reviewCount = count("review") + (introTier === "review" ? 1 : 0);

  // 40-point bucket: one live item establishes the category, then additional
  // live evidence earns diminishing credit so the score cannot be gamed by volume.
  const livePoints = 40 * (1 - Math.exp(-liveCount / 3));

  // 20-point bucket: declared original + screened uploads (legacy declarations count half).
  // This is a declaration backed by screening, not a technical verification.
  const originalCount = declaredCount + legacyCount * 0.5;
  const originalPoints = 20 * (1 - Math.exp(-originalCount / 5));

  // 15-point bucket: breadth of evidence. Videos receive slightly more weight
  // because they contain more contextual proof. Items under review count half.
  const weight = (item) => (tierKey(item) === "review" ? 0.5 : 1);
  const videoCount = allMedia.filter(item => item.type === "video").length + (intro ? 1 : 0);
  const imageCount = allMedia.filter(item => item.type === "image").length;
  const volumeUnits = allMedia.reduce((s, item) => s + weight(item) * (item.type === "video" ? 1.25 : item.type === "image" ? 1 : 0), 0) + (intro ? 1.25 * weight(intro) : 0);
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
    counts: { live: liveCount, original: declaredCount + legacyCount, declared: declaredCount, legacy: legacyCount, review: reviewCount, videos: videoCount, photos: imageCount, references: referenceCount },
  };
}

export function scoreLabel(score) {
  if (score >= 80) return "Strong proof profile";
  if (score >= 60) return "Good proof profile";
  if (score >= 40) return "Building proof";
  return "Getting started";
}
