const KEY = "pdp-profile-draft-v2";

const DEFAULT_DRAFT = {
  name: "", role: "", location: "", email: "", phone: "", pdpId: "", introduction: "", about: "",
  roleProfileId: "", heroMediaId: "", skills: [], experience: [],
  stats: { experience: "", projects: 0, awards: 0, specialization: "" },
};

export function getDraft() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_DRAFT, ...JSON.parse(raw), stats: { ...DEFAULT_DRAFT.stats, ...(JSON.parse(raw).stats || {}) } } : { ...DEFAULT_DRAFT, stats: { ...DEFAULT_DRAFT.stats } };
  } catch { return { ...DEFAULT_DRAFT, stats: { ...DEFAULT_DRAFT.stats } }; }
}

export function saveDraft(patch = {}) {
  const next = { ...getDraft(), ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function addExperience(experience) {
  const draft = getDraft();
  const exists = draft.experience.some(item => item.company === experience.company);
  if (exists) return draft;
  return saveDraft({ experience: [...draft.experience, experience] });
}

export function clearDraft() { window.localStorage.removeItem(KEY); }
