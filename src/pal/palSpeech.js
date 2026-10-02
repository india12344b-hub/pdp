/*
  PDP Pal — speech repair. Pure functions (no browser APIs), so they are easy to test.
  Browser speech recognition makes predictable mistakes: fillers, stutters, spoken letters ("ef em see jee"),
  spoken numbers ("five plus years"), and near-miss spellings ("mangar"). This file repairs them using
  PDP's own vocabulary before Pal tries to understand the sentence.
*/
import { SYN, STOP, clean } from "./palLang";
import { ROLE_PROFILES, SHORTLIST_ALIASES } from "../pdpProfileData";

const CITIES = ["delhi", "mumbai", "bangalore", "bengaluru", "pune", "hyderabad", "chennai", "kolkata", "gurgaon", "gurugram", "noida", "ahmedabad", "jaipur", "lucknow", "chandigarh", "indore", "kochi", "nagpur", "surat", "bhopal"];
const ROLE_WORDS = ["manager", "executive", "director", "head", "lead", "analyst", "consultant", "associate", "intern", "officer", "specialist", "architect", "designer", "developer", "engineer", "teacher", "professor", "marketer", "salesman", "supervisor", "coordinator"];

const words = (str) => String(str || "").toLowerCase().split(/[^a-z0-9+]+/).filter((w) => w.length > 1);

let base = null;
/* domainVocab(extra) → Set of words PDP "knows": roles, skills, areas, cities + anything in `extra` (names, companies…). */
export function domainVocab(extra = []) {
  if (!base) {
    base = new Set();
    const add = (s) => words(s).filter((w) => !STOP.has(w)).forEach((w) => base.add(w));
    Object.entries(SYN).forEach(([k, v]) => { add(k); v.forEach(add); });
    Object.values(ROLE_PROFILES).forEach((r) => { add(r.category); add(r.title); (r.shortlistTools || []).forEach(add); (r.snapshot || []).forEach((x) => add(x.label)); });
    Object.entries(SHORTLIST_ALIASES).forEach(([k, v]) => { add(k); v.forEach(add); });
    CITIES.forEach(add); ROLE_WORDS.forEach(add);
  }
  if (!extra.length) return base;
  const out = new Set(base);
  extra.forEach((e) => words(e).forEach((w) => out.add(w)));
  return out;
}

/* ---------- small helpers ---------- */
function lev(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 9;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

const FILLERS = new Set(["um", "umm", "uh", "uhh", "er", "ah", "hmm", "hm", "basically", "actually", "matlab", "yaar", "bhai", "okay", "ok", "pal"]);
const PHON = { ef: "f", em: "m", see: "c", sea: "c", jee: "g", gee: "g", you: "u", yu: "u", ex: "x", why: "y", eye: "i", ay: "a", bee: "b", dee: "d", are: "r", es: "s", tee: "t", kay: "k", el: "l", en: "n", oh: "o", pee: "p", queue: "q", vee: "v", zed: "z", aitch: "h" };
export const ACRONYMS = new Set(["fmcg", "ux", "ui", "gtm", "btl", "crm", "erp", "seo", "sem", "kpi", "okr", "hr", "b2b", "b2c", "mba", "sql", "aws", "api", "qa", "cfo", "ceo", "cto", "sap", "kam", "rsm", "asm", "tsm", "ooh", "bd", "ml", "ai"]);
const UNITS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50 };
const NUM = { ...UNITS, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, ...TENS,
  ek: 1, teen: 3, chaar: 4, char: 4, paanch: 5, panch: 5, chhe: 6, chhah: 6, saat: 7, aath: 8, nau: 9, das: 10, gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, bees: 20 };
const YEARW = /^(years?|yrs?|yr|saal|sal|plus|\+)$/;

function dropFillers(t) {
  const out = [];
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "you" && t[i + 1] === "know") { i++; continue; }
    if (t[i] === "i" && t[i + 1] === "mean") { i++; continue; }
    if (FILLERS.has(t[i])) continue;
    out.push(t[i]);
  }
  return out;
}
const dedupe = (t) => t.filter((w, i) => i === 0 || w !== t[i - 1]);

function acronyms(t) {
  const letter = (w) => (PHON[w] ? PHON[w] : /^[a-z]$/.test(w) ? w : null);
  const out = [];
  for (let i = 0; i < t.length; i++) {
    let joined = "", j = i, hit = null;
    while (j < t.length && j - i < 6) {
      const l = letter(t[j]);
      if (!l) break;
      joined += l; j++;
      if (j - i >= 2 && ACRONYMS.has(joined)) hit = { j, joined };
    }
    if (hit) { out.push(hit.joined); i = hit.j - 1; } else out.push(t[i]);
  }
  return out;
}

function numbers(t) {
  const out = [];
  for (let i = 0; i < t.length; i++) {
    const w = t[i], n1 = t[i + 1], n2 = t[i + 2] || "";
    if (w in TENS && n1 in UNITS && YEARW.test(n2)) { out.push(String(TENS[w] + UNITS[n1])); i++; continue; }
    if (w in NUM && YEARW.test(n1 || "")) { out.push(String(NUM[w])); continue; }
    out.push(w);
  }
  const merged = [];
  for (let i = 0; i < out.length; i++) {
    if (/^\d+$/.test(out[i]) && out[i + 1] === "plus") { merged.push(`${out[i]}+`); i++; } else merged.push(out[i]);
  }
  return merged;
}

function fuzzy(t, vocab) {
  const list = [...vocab];
  return t.map((w) => {
    if (w.length < 5 || vocab.has(w) || STOP.has(w) || /\d/.test(w)) return w;
    const max = w.length <= 7 ? 1 : 2;
    let best = null, bd = 9;
    for (const v of list) {
      if (v[0] !== w[0] || v.length < 5) continue;
      const d = lev(w, v);
      if (d <= max && d < bd) { best = v; bd = d; }
    }
    return best || w;
  });
}

/* repairTranscript(text, vocab) → cleaned, repaired, lowercase sentence Pal can parse. */
export function repairTranscript(text, vocab = domainVocab()) {
  let t = clean(text).split(" ").filter(Boolean);
  t = dropFillers(t);
  t = dedupe(t);
  t = acronyms(t);
  t = numbers(t);
  t = fuzzy(t, vocab);
  return t.join(" ");
}

/* bestAlt(alternatives, vocab) → the alternative that is both confident and sounds like PDP. */
export function bestAlt(alts, vocab = domainVocab()) {
  let best = null;
  for (const a of alts) {
    const hits = clean(a.transcript).split(" ").filter((w) => vocab.has(w)).length;
    const s = (a.confidence || 0.5) + 0.12 * hits;
    if (!best || s > best.s) best = { ...a, s };
  }
  return best;
}
