const KEY = "pdp-profile-draft-v1";

const DEFAULT_DRAFT = {
  name: "",
  role: "",
  location: "",
  experience: [],
};

export function getDraft() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_DRAFT, ...JSON.parse(raw) } : { ...DEFAULT_DRAFT };
  } catch {
    return { ...DEFAULT_DRAFT };
  }
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

export function clearDraft() {
  window.localStorage.removeItem(KEY);
}
