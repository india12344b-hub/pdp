/*
  PDP Pal — data adapters. The ONLY place Pal reads PDP data from.
  To connect new sources (backend search, jobs API...) change these functions; nothing else in Pal needs to change.
*/
import { getDraft } from "../pdpDraft";
import { getMedia, getProfile, getAssetStatus } from "../pdpStorage";

export async function loadMyProfile() {
  let draft = getDraft();
  try { const cloud = await getProfile(); if (cloud?.profile) draft = { ...draft, ...cloud.profile }; } catch {}
  let media = [];
  try { media = (await getMedia()) || []; } catch {}
  return { draft, mediaCount: media.length };
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
    proofCount: mediaCount + (assets.intro ? 1 : 0), haystack, url: "/pdp/me",
  }];
}
