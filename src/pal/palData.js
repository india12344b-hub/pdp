/*
  PDP Pal — data adapters. The ONLY place Pal reads PDP data from.
  To connect new sources (backend search, jobs API...) change these functions; nothing else in Pal needs to change.
*/
import { getDraft } from "../pdpDraft";
import { getMedia, getProfile, getAssetStatus, getIntro } from "../pdpStorage";

export async function loadMyProfile() {
  let draft = getDraft();
  try { const cloud = await getProfile(); if (cloud?.profile) draft = { ...draft, ...cloud.profile }; } catch {}
  let media = [];
  let intro = null;
  try { media = (await getMedia()) || []; } catch {}
  try { intro = await getIntro(); } catch {}
  return { draft, media, intro, mediaCount: media.length };
}

export async function getAssets() {
  try { return await getAssetStatus(); } catch { return { resume: false, intro: false }; }
}

/* Searchable candidates. Today: the one live local profile. Later: replace with a backend search call. */
export async function loadProfiles() {
  const { draft: d, mediaCount } = await loadMyProfile();
  if (!d.name || !d.role) return [];
  const assets = await getAssets();
  const haystack = [
    d.name, d.role, d.location, d.about, ...(d.skills || []),
    ...(d.experience || []).flatMap((x) => [x.company, x.role, x.desc, x.highlight, ...(x.tags || [])]),
  ].filter(Boolean).join(" ").toLowerCase();
  return [{
    id: "me", name: d.name, role: d.role, location: d.location, experience: d.stats?.experience,
    skills: d.skills || [], companies: (d.experience || []).map((x) => x.company),
    proofCount: mediaCount + (assets.intro ? 1 : 0), haystack, url: `/${d.pdpId || String(d.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
  }];
}

/* One professional's full documented evidence — what "Ask this PDP" answers from. Later: GET /api/candidates/:id */
export async function loadDossier(id = "me") {
  const { draft: d, media } = await loadMyProfile();
  if (!d.name || !d.role) return null;
  return {
    id: "me", name: d.name, role: d.role, location: d.location, experienceYears: d.stats?.experience,
    skills: d.skills || [], about: d.about || "", introduction: d.introduction || "", experience: d.experience || [],
    media: media.map((m) => ({ company: m.company, category: m.category, note: m.note, type: m.type, url: m.url })),
  };
}
