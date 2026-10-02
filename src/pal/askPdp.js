/*
  Ask this PDP — answers a recruiter's question about ONE professional, using ONLY that person's own
  documented evidence (experience entries, skills, story, and uploaded proof). Nothing is guessed:
    - Evidence found      → "Yes", with the exact evidence and how much proof is attached.
    - Only partly found   → "Partly", showing what exists.
    - Nothing found       → "Not documented" — and it says that is not the same as "no".
  Pure functions: the Pal source (palSources.js) and the Ask this PDP card (AskThisPdp.jsx) both use this.

  dossier = { name, role, location, experienceYears, skills[], about, introduction,
              experience[{company, role, years, desc, highlight, tags[]}],
              media[{company, category, note, type, url}] }
*/
import { L, STOP, expand } from "./palLang";
import { SHORTLIST_ALIASES } from "../pdpProfileData";
import { domainVocab, ACRONYMS } from "./palSpeech";

/* ---------- understanding the question ---------- */
const QW = new Set([
  "what","how","many","much","long","does","did","do","has","have","had","is","are","was","were","can","could","will","would","he","she","they",
  "his","her","their","him","them","candidate","this","that","these","any","ever","worked","work","working","experience","experienced","exposure",
  "handled","handle","managed","manage","led","lead","built","launched","years","year","yrs","saal","about","tell","show","with","in","on","at",
  "of","for","the","a","an","and","or","to","from","it","kya","kaise","kitna","kitne","unka","uska","uski","unki","ne","hai","hain","ho","tha",
  "thi","kiya","kiye","anubhav","proof","proofs","evidence","video","videos","photo","photos","media","result","results","achievement","achievements",
  "impact","metric","metrics","outcome","where","based","location","located","city","role","position","title","skills","skill","expertise",
  "company","companies","which","who","summary","overview","pdp","profile","please","pls","has","get","got","done","do","does","been","before",
  "mujhe","dikhao","batao","bataiye","unhone","isne","usne","kahan","kaun","kaunsi","kaunse","wala","wale","ki","ka","ke","me","mein","se","ko",
]);

const FIRST_PERSON = /\b(my|mera|meri|mere|mujhe|main)\b/;
const THIRD = /\b(he|she|his|her|him|they|them|their|uska|uski|unka|unki|isne|usne|unhone|candidate|this pdp|this profile)\b/;
const CAP = /(experience (with|in|of)|worked (on|in|with|at)|work(ed)? at|handled|managed|\bled\b|built|launched|any experience|exposure|ever )/;
const PROOFQ = /(proof|evidence|videos?|photos?|result|achievement)/;
const QUESTIONISH = /^(what|how|which|where|who|did|does|has|have|can|is|are|any|tell|show|kya|kaun|kitne|kitna|kahan|kaunsi|kaunse)\b/;

const TYPE = {
  summary: /(tell me about|summary|summari[sz]e|overview|introduce|who is|about (him|her|them|this (candidate|profile|pdp)))/,
  proof: /(proof|evidence|videos?|photos?|media|show .*work)/,
  results: /(result|achievement|impact|metric|outcome|accomplish|award)/,
  companies: /(which compan|what compan|where did .*work|kahan kaam|kaun si compan|companies)/,
  duration: /(how many years|how long|kitne saal|kitne sal|years of|saal ka)/,
};

/* Should Pal treat this message as a question about the candidate on screen? */
export function isCandidateQuestion(norm, raw, { onProfile, hasTarget }) {
  if (!onProfile && !hasTarget) return false;
  if (FIRST_PERSON.test(norm)) return false;
  const questionish = QUESTIONISH.test(norm) || String(raw).trim().endsWith("?") || CAP.test(norm);
  if (!questionish) return false;
  if (THIRD.test(norm)) return true;
  return CAP.test(norm) || PROOFQ.test(norm);
}

export const dossierWords = (d) => [
  d.name, d.role, d.location, ...(d.skills || []),
  ...(d.experience || []).flatMap((e) => [e.company, e.role, ...(e.tags || [])]),
  ...(d.media || []).flatMap((m) => [m.company, m.category]),
];

const stem = (w) => w.replace(/(ing|ed|es|s)$/, "");
const known = (vocab, t) => vocab.has(t) || vocab.has(stem(t));
const baseWord = (vocab, t) => (vocab.has(t) ? t : vocab.has(stem(t)) ? stem(t) : t);
const pretty = (label) => label.split(/(\s+|\/)/).map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))).join("");

export function topicTokens(norm, vocab) {
  let toks = [...new Set(norm.split(" ").filter((w) => w.length > 1 && !QW.has(w) && !STOP.has(w) && !/^\d+\+?$/.test(w)))];
  if (toks.length > 3 && vocab) { const k = toks.filter((t) => known(vocab, t)); if (k.length) toks = k; } // long, rambling question → keep the meaningful words
  return toks;
}

/* Turn the topic into groups of equivalent terms. The longest matching experience-area phrase wins, so
   "distributor management" is one group, not three. */
function buildGroups(norm, toks, vocab) {
  const hit = (k) => new RegExp(`(?:^| )${esc(k)}[a-z]{0,3}(?: |$)`).test(norm);
  const cand = [];
  for (const [label, keys] of Object.entries(SHORTLIST_ALIASES)) {
    let best = "";
    for (const k of [...keys, label]) if (hit(k) && k.length > best.length) best = k;
    if (best) cand.push({ label, keys, best });
  }
  cand.sort((a, b) => b.best.length - a.best.length);
  const groups = [], covered = new Set();
  for (const c of cand) {
    const ws = c.best.split(" ");
    if (ws.every((w) => covered.has(stem(w)))) continue;
    groups.push({ alts: new Set([...c.keys, c.label]), label: pretty(c.label) });
    ws.forEach((w) => covered.add(stem(w)));
  }
  for (const t of toks) {
    if (covered.has(stem(t))) continue;
    const b = baseWord(vocab, t);
    groups.push({ alts: new Set(expand(b)), label: pretty(b) });
  }
  return groups;
}

/* ---------- evidence ---------- */
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (hay, w) => (w.length <= 3 ? new RegExp(`(^|[^a-z0-9])${esc(w)}($|[^a-z0-9])`).test(hay) : hay.includes(w));
const low = (...p) => p.flat().filter(Boolean).join(" ").toLowerCase();
const clip = (s, n = 160) => { const t = String(s || "").replace(/\s+/g, " ").trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };

function buildUnits(d) {
  const media = d.media || [];
  const proofFor = (company) => media.filter((m) => m.company && m.company === company).length;
  const units = [];
  (d.experience || []).forEach((e) => units.push({
    kind: "experience", prio: 3, company: e.company, years: e.years,
    title: `${e.role || "Role"}${e.years ? ` · ${e.years}` : ""}`, text: clip(e.highlight || e.desc),
    proofCount: proofFor(e.company), hay: low(e.company, e.role, e.desc, e.highlight, e.tags),
  }));
  media.forEach((m) => units.push({
    kind: "proof", prio: 3, company: m.company || "", mediaType: m.type, url: m.url,
    title: `${m.type === "video" ? "Video" : "Photo"} proof${m.category ? ` · ${m.category}` : ""}`, text: clip(m.note),
    hay: low(m.company, m.category, m.note),
  }));
  (d.skills || []).forEach((s) => units.push({ kind: "skill", prio: 2, title: "Listed skill", text: s, hay: low(s) }));
  const story = [d.about, d.introduction].filter(Boolean).join(" ");
  if (story) units.push({ kind: "about", prio: 1, title: "Profile story", text: clip(story), hay: low(story) });
  return units;
}

function roleYears(e) {
  const s = String(e.years || "");
  let m = s.match(/(\d+)\s*(?:years?|yrs?)/i);
  if (m) return +m[1];
  m = s.match(/(\d{4})\s*[—–-]\s*(present|\d{4})/i);
  if (m) return Math.max(0, (/present/i.test(m[2]) ? new Date().getFullYear() : +m[2]) - +m[1]);
  return null;
}

const ev = (u) => ({ kind: u.kind, company: u.company || "", title: u.title, text: u.text, proofCount: u.proofCount, url: u.url, mediaType: u.mediaType });
const plural = (n, w, ws) => (n === 1 ? w : ws || `${w}s`);

/* ---------- the answer ---------- */
export function askProfile(raw, norm, d) {
  const name = d.name || "This professional";
  const units = buildUnits(d);
  const proofTotal = (d.media || []).length;
  const type = TYPE.summary.test(norm) ? "summary" : TYPE.proof.test(norm) ? "proof" : TYPE.results.test(norm) ? "results" : TYPE.companies.test(norm) ? "companies" : TYPE.duration.test(norm) ? "duration" : "capability";

  const vocab = domainVocab(dossierWords(d));
  const toks = topicTokens(norm, vocab);
  const groups = buildGroups(norm, toks, vocab);
  const topic = groups.map((g) => g.label).join(" + ");
  const hasTopic = groups.length > 0;
  const q = (s) => `${s}`;

  const match = () => {
    const scored = units.map((u) => ({ u, n: groups.filter((g) => [...g.alts].some((a) => has(u.hay, a))).length }));
    const full = scored.filter((x) => x.n === groups.length).map((x) => x.u).sort((a, b) => b.prio - a.prio);
    const partial = scored.filter((x) => x.n > 0 && x.n < groups.length).map((x) => x.u).sort((a, b) => b.prio - a.prio);
    return { full, partial };
  };
  const follow = (t) => [
    { label: L("Show proof", "Proof dikhao"), q: `show his proof${t ? ` of ${t}` : ""}` },
    { label: L("Which companies?", "Kaunsi companies?"), q: `which companies did he work with${t ? ` on ${t}` : ""}` },
    { label: L("Years of experience", "Kitne saal ka experience"), q: `how many years of ${t || "work"} experience does he have` },
  ];
  const focus = (list) => list.find((u) => u.kind === "experience" || u.company)?.company || "";

  /* --- summary --- */
  if (type === "summary") {
    const exps = units.filter((u) => u.kind === "experience");
    const companies = exps.map((u) => u.company).filter(Boolean);
    const yrs = d.experienceYears ? `${String(d.experienceYears).replace(/\+?$/, "")}+ years of experience. ` : "";
    return {
      type, verdict: "info", topic: "",
      headline: L(`${name} — ${d.role || "professional"}${d.location ? ` based in ${d.location}` : ""}. ${yrs}${companies.length ? `Worked at ${companies.join(", ")}. ` : ""}${(d.skills || []).length ? `Skills: ${d.skills.join(", ")}. ` : ""}${proofTotal} proof ${plural(proofTotal, "item")} attached.`.trim(),
                  `${name} — ${d.role || "professional"}${d.location ? `, ${d.location} me` : ""}. ${yrs ? yrs.replace("years of experience", "saal ka experience") : ""}${companies.length ? `${companies.join(", ")} me kaam kiya. ` : ""}${(d.skills || []).length ? `Skills: ${d.skills.join(", ")}. ` : ""}${proofTotal} proof ${plural(proofTotal, "item")} attached.`.trim()),
      evidence: exps.slice(0, 4).map(ev), followups: follow(""), focusCompany: companies[0] || "",
    };
  }

  /* --- proof --- */
  if (type === "proof") {
    const m = hasTopic ? match() : { full: units.filter((u) => u.kind === "proof"), partial: [] };
    const items = m.full.filter((u) => u.kind === "proof" || u.kind === "experience");
    let proofItems = items.filter((u) => u.kind === "proof");
    let related = false;
    if (!proofItems.length && m.partial.some((u) => u.kind === "proof")) { proofItems = m.partial.filter((u) => u.kind === "proof"); related = true; } // question had two topics: show proof for either
    if (!proofItems.length) {
      return { type, verdict: "no", topic, headline: L(`No proof media is attached${hasTopic ? ` for ${topic}` : ""} in ${name}'s PDP yet.`, `${name} ke PDP me${hasTopic ? ` ${topic} ke liye` : ""} abhi koi proof media attach nahi hai.`), evidence: items.slice(0, 3).map(ev), followups: follow(topic), focusCompany: focus(items) };
    }
    const vids = proofItems.filter((u) => u.mediaType === "video").length, pics = proofItems.length - vids;
    const head = related
      ? L(`No single proof item covers all of “${topic}”, but ${proofItems.length} related proof ${plural(proofItems.length, "item")} exist (${pics} ${plural(pics, "photo")}, ${vids} ${plural(vids, "video")}).`, `“${topic}” ke sabhi hisson ko cover karne wala ek proof nahi hai, lekin ${proofItems.length} related proof items hain (${pics} photo, ${vids} video).`)
      : L(`${proofItems.length} proof ${plural(proofItems.length, "item")}${hasTopic ? ` for ${topic}` : ""}: ${pics} ${plural(pics, "photo")}, ${vids} ${plural(vids, "video")}.`, `${hasTopic ? `${topic} ke liye ` : ""}${proofItems.length} proof items: ${pics} photo, ${vids} video.`);
    return { type, verdict: related ? "partial" : "yes", topic, headline: head, evidence: proofItems.slice(0, 4).map(ev), followups: follow(topic), focusCompany: focus(proofItems) };
  }

  /* --- results --- */
  if (type === "results") {
    const pool = units.filter((u) => u.kind === "experience" && u.text);
    const list = hasTopic ? match().full.filter((u) => u.kind === "experience") : pool;
    if (!list.length) return { type, verdict: "no", topic, headline: L(`No specific results${hasTopic ? ` for ${topic}` : ""} are documented in ${name}'s PDP yet.`, `${name} ke PDP me${hasTopic ? ` ${topic} ke` : ""} specific results abhi documented nahi hain.`), evidence: [], followups: follow(topic), focusCompany: "" };
    return { type, verdict: "yes", topic, headline: L(`Here's what ${name} has documented${hasTopic ? ` around ${topic}` : ""}:`, `${name} ne${hasTopic ? ` ${topic} ke aaspaas` : ""} ye document kiya hai:`), evidence: list.slice(0, 4).map(ev), followups: follow(topic), focusCompany: focus(list) };
  }

  /* --- companies --- */
  if (type === "companies") {
    const list = hasTopic ? match().full.filter((u) => u.kind === "experience") : units.filter((u) => u.kind === "experience");
    if (!list.length) return { type, verdict: "no", topic, headline: L(`No company in ${name}'s PDP documents ${topic || "that"} yet.`, `${name} ke PDP me koi company ${topic || "ye"} document nahi karti.`), evidence: [], followups: follow(topic), focusCompany: "" };
    const names = [...new Set(list.map((u) => u.company))];
    return { type, verdict: "yes", topic, headline: L(`${name}${hasTopic ? ` has ${topic} experience at` : " has worked at"} ${names.join(", ")}.`, `${name}${hasTopic ? ` ka ${topic} experience` : ""} ${names.join(", ")} me hai.`), evidence: list.slice(0, 4).map(ev), followups: follow(topic), focusCompany: names[0] };
  }

  if (!hasTopic) return null; // nothing to look up → let other sources answer

  const { full, partial } = match();

  /* --- duration --- */
  if (type === "duration") {
    const roles = full.filter((u) => u.kind === "experience");
    if (!roles.length) return { type, verdict: "no", topic, headline: L(`${topic} experience isn't documented in ${name}'s PDP, so I can't give a number.`, `${name} ke PDP me ${topic} experience documented nahi hai, isliye number nahi bata sakti.`), evidence: partial.slice(0, 3).map(ev), followups: follow(topic), focusCompany: "" };
    const parts = roles.map((u) => { const y = roleYears({ years: u.years }); return { company: u.company, y }; });
    const known = parts.filter((p) => p.y !== null);
    const total = known.reduce((a, p) => a + p.y, 0);
    const list = parts.map((p) => `${p.company}${p.y !== null ? ` (${p.y} ${plural(p.y, "yr")})` : ""}`).join(", ");
    return {
      type, verdict: "yes", topic,
      headline: L(`${topic} appears in ${roles.length} ${plural(roles.length, "role")}: ${list}${known.length ? ` — about ${total} ${plural(total, "year")} in total` : ""}. This counts whole roles that mention it, so time spent on ${topic} itself may be less.`,
                  `${topic} ${roles.length} ${plural(roles.length, "role", "roles")} me dikhta hai: ${list}${known.length ? ` — kul lagbhag ${total} saal` : ""}. Ye poore roles ka hisaab hai, isliye ${topic} par asli samay kam ho sakta hai.`),
      evidence: roles.slice(0, 4).map(ev), followups: follow(topic), focusCompany: roles[0].company,
    };
  }

  /* --- capability (default) --- */
  if (full.length) {
    const lead = full.find((u) => u.kind === "experience") || full[0];
    const pc = lead.kind === "experience" ? lead.proofCount : 0;
    const proofEn = lead.kind === "experience" ? (pc ? ` ${pc} proof ${plural(pc, "item")} attached for ${lead.company}.` : ` No proof media is attached for ${lead.company} yet.`) : "";
    const proofHi = lead.kind === "experience" ? (pc ? ` ${lead.company} ke ${pc} proof items attached hain.` : ` ${lead.company} ke liye abhi proof media attach nahi hai.`) : "";
    return { type, verdict: "yes", topic, headline: L(`Yes — ${name}'s PDP documents ${topic} experience.${proofEn}`, `Haan — ${name} ke PDP me ${topic} experience documented hai.${proofHi}`), evidence: full.slice(0, 4).map(ev), followups: follow(topic), focusCompany: focus(full) };
  }
  if (partial.length) {
    return { type, verdict: "partial", topic, headline: L(`Partly. I found related experience, but nothing that covers all of “${topic}”.`, `Partly. Related experience mila, lekin “${topic}” ka poora match nahi mila.`), evidence: partial.slice(0, 3).map(ev), followups: follow(topic), focusCompany: focus(partial) };
  }
  return { type, verdict: "no", topic, headline: L(`${topic} experience isn't documented in ${name}'s PDP. That doesn't mean they don't have it — it may simply not be added yet.`, `${name} ke PDP me ${topic} experience documented nahi hai. Iska matlab ye nahi ki unke paas nahi hai — shayad abhi add nahi hua.`), evidence: [], followups: follow(topic), focusCompany: "" };
}
