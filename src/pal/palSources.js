/*
  PDP Pal — built-in sources, in priority order:
    100 control     greetings, help, language switch, "forget me", jump-to-page, recap of last visit
     90 followup    "the second one", "how much experience does he have", "shortlist him"  (uses session)
     80 search      recruiter requirement → live profiles
     70 profile     questions about the profile on screen ("my experience at XYZ")
     60 coach       "what should I do next" → checklist from real profile state
     50 knowledge   structured PDP knowledge base, boosted by the current page
      0 fallback    honest "I don't know that" + logs the question
  Each source is independent. Add new ones with registerSource() (see palEngine.js).
*/
import { registerSource } from "./palEngine";
import { L, pick, tokenize, expand } from "./palLang";
import { matchKnowledge, PAGE_SUGGESTIONS } from "./palKnowledge";
import { loadMyProfile, loadProfiles, getAssets } from "./palData";
import * as mem from "./palMemory";

const QUESTION = /^(what|how|why|who|when|where|which|is|are|can|could|do|does|kya|kaise|kyun|kab|kaun|kitna)\b/;
const wordCount = (s) => s.split(" ").filter(Boolean).length;
const yearsOf = (norm) => { const m = norm.match(/(\d+)\s*\+?\s*(?:years?|yrs?|yr|saal|sal)\b/); return m ? parseInt(m[1], 10) : null; };
const yrs = (e) => { const s = String(e || "").trim(); const n = parseFloat(s); if (!s || Number.isNaN(n)) return null; return /\+/.test(s) ? `${n}+` : `${n}`; };
const card = (p) => ({ id: p.id, name: p.name, role: p.role, location: p.location, experience: p.experience, skills: p.skills, companies: p.companies, proofCount: p.proofCount, url: p.url });
const chip = (en, hi, send) => ({ label: L(en, hi), send });
const link = (url, en, hi) => ({ url, label: L(en, hi) });

/* =============== welcome (called by the UI, not a source) =============== */
const WELCOME = {
  home: L("Hi! I'm PDP Pal. Ask me how PDP works or how to create your profile.", "Hi! Main PDP Pal hoon. PDP kaise kaam karta hai ya profile kaise banana hai, mujhse poochho."),
  professionals: L("Hi! I'm PDP Pal. Ask me how PDP helps professionals — resume, proof of work, sharing your profile.", "Hi! Main PDP Pal hoon. PDP professionals ki kaise madad karta hai — resume, proof of work, profile sharing — mujhse poochho."),
  resume: L("This is where you upload your resume. Ask me about formats or what happens next.", "Yahan aap resume upload karte ho. Formats ya aage kya hoga, mujhse poochho."),
  proof: L("This is where you add proof of work. Ask me what kind of photos or videos to upload.", "Yahan aap proof of work jodte ho. Kaunsi photos/videos upload karni hain, mujhse poochho."),
  profile: L("This is the PDP profile. Ask me about experience, skills or how to share it.", "Ye PDP profile hai. Experience, skills ya share karne ke baare me poochho."),
  recruiter: L("Hi! Describe the professional you need — for example “FMCG sales manager 8 years Delhi”. Type or use the mic.", "Hi! Bataiye kaisa professional chahiye — jaise “FMCG sales manager 8 saal Delhi”. Type karo ya mic use karo."),
};

export function welcome({ page, session, memory, navigated }) {
  const sel = session.selectedCandidate;
  if (navigated && page === "profile" && sel) {
    return { text: L(`Here's ${sel.name}'s PDP. Ask me about experience, skills or proof.`, `Ye raha ${sel.name} ka PDP. Experience, skills ya proof ke baare me poochho.`) };
  }
  if (!navigated && page === "recruiter" && memory.searches?.[0]) {
    const q = memory.searches[0];
    return {
      text: L(`Welcome back! Last time you searched “${q}”. Want to run it again?`, `Wapas swagat hai! Pichli baar aapne “${q}” search kiya tha. Dobara chalaun?`),
      chips: [{ label: L("Search again", "Dobara search karo"), send: q }],
    };
  }
  return { text: WELCOME[page] || WELCOME.home };
}

/* =============== 100 · control =============== */
const HELP = {
  recruiter: L("Describe who you need — role, skill, experience, location. Then say “open the first one”, “how much experience does he have?” or “shortlist him”.", "Bataiye kaun chahiye — role, skill, experience, location. Phir bolo “pehla kholo”, “uska experience kitna hai?” ya “shortlist karo”."),
  profile: L("Ask about the experience, skills or location on this profile — for example “show me my experience at XYZ” — or “what should I do next?”.", "Is profile ka experience, skills ya location poochho — jaise “XYZ me mera experience dikhao” — ya “aage kya karun?”."),
  proof: L("Ask what to upload, how to link evidence to a company, or how authenticity works.", "Poochho kya upload karna hai, evidence ko company se kaise jodna hai, ya authenticity kaise kaam karti hai."),
  resume: L("Ask about resume formats, what happens after upload, or how to create your profile.", "Resume formats, upload ke baad kya hoga, ya profile kaise banana hai — poochho."),
  professionals: L("Ask me how PDP works, what Proof of Work is, or how to share your profile.", "Poochho PDP kaise kaam karta hai, Proof of Work kya hai, ya profile kaise share karein."),
  home: L("Ask me how PDP works, who it's for, or how to get started. Recruiters can describe who they need.", "Poochho PDP kaise kaam karta hai, kiske liye hai, ya shuru kaise karein. Recruiters bata sakte hain kaun chahiye."),
};

const GO = [
  [/(recruiter page|discover talent|talent page)/, "/recruiters", L("Opening Discover Talent.", "Discover Talent khol rahi hoon.")],
  [/(my pdp|my profile|apna profile|mera profile|my page)/, "/pdp/me", L("Opening your PDP.", "Aapka PDP khol rahi hoon.")],
  [/(upload resume|resume page|resume step)/, "/upload-resume", L("Opening the resume step.", "Resume step khol rahi hoon.")],
  [/(proof of work|proof page|build proof|upload proof)/, "/build-proof", L("Opening Proof of Work.", "Proof of Work khol rahi hoon.")],
  [/(professionals page|for professionals)/, "/professionals", L("Opening the professionals page.", "Professionals page khol rahi hoon.")],
];

const control = {
  id: "control", priority: 100,
  run(ctx) {
    const { norm, page, session, memory } = ctx;

    if (/^(hi+|hello|hey|namaste|namaskar|hii+)\b/.test(norm) && wordCount(norm) <= 3) {
      return { text: L("Hello! How can I help?", "Namaste! Kaise madad karun?") };
    }
    if (/^(thanks|thank you|thx|shukriya|dhanyavad|thanks a lot)\b/.test(norm)) {
      return { text: L("You're welcome!", "Aapka swagat hai!") };
    }
    if (/(forget me|forget everything|clear (my )?(memory|history|data)|sab bhool|memory (clear|delete)|reset memory|mujhe bhool)/.test(norm)) {
      return { text: L("Done — I've cleared my memory of you on this device.", "Ho gaya — is device par mera aapke baare me jo yaad tha sab clear kar diya."), actions: [{ type: "forget" }] };
    }
    if (/(speak|reply|talk|answer|bolo|baat|jawab).*english|english (me|mein|please|only)/.test(norm)) {
      return { lang: "en", text: L("Sure — I'll reply in English.", "Sure — English me jawab dungi.") };
    }
    if (/(speak|reply|talk|answer|bolo|baat|jawab).*(hinglish|hindi)|(hinglish|hindi) (me|mein|please)/.test(norm)) {
      return { lang: "hi", text: L("Sure — I'll switch to Hinglish.", "Theek hai — ab Hinglish me baat karungi.") };
    }
    if ((/\b(help|madad)\b/.test(norm) && wordCount(norm) <= 3) || /what can you do here|kya kar sakti/.test(norm)) {
      return { text: HELP[page] || HELP.home };
    }
    if (/(last time|pichli baar|previous search|what did i (do|search)|recent search)/.test(norm)) {
      const s = memory.searches || [];
      if (!s.length) return { text: L("I don't have any earlier searches on this device yet.", "Is device par abhi koi pichla search yaad nahi hai.") };
      return {
        text: L(`Your recent searches: ${s.map((x) => `“${x}”`).join(", ")}.`, `Aapke recent searches: ${s.map((x) => `“${x}”`).join(", ")}.`),
        chips: [{ label: L(`Run “${s[0]}” again`, `“${s[0]}” dobara chalao`), send: s[0] }],
      };
    }
    if (/\b(open|go to|take me|le chalo|le jao|kholo|chalo)\b/.test(norm)) {
      for (const [re, url, text] of GO) if (re.test(norm)) return { text, actions: [{ type: "navigate", url }] };
    }
    if (/^(clear|reset|naya|new search)\b/.test(norm)) {
      return { text: L("Cleared. Tell me the new requirement.", "Ho gaya. Naya requirement batao."), session: { lastIntent: null, lastQuery: "", lastResults: [], selectedCandidate: null } };
    }
    return null;
  },
};

/* =============== 90 · followup (session-aware) =============== */
const ORD = [["first|1st|pehla|pehle", 0], ["second|2nd|dusra|doosra|dusre", 1], ["third|3rd|teesra|tisra", 2], ["fourth|4th|chautha", 3], ["fifth|5th|panchva", 4], ["last|aakhri|aakhir", -1]];
const ordinal = (norm) => { for (const [re, i] of ORD) if (new RegExp(`\\b(${re})\\b`).test(norm)) return i; return null; };
const PRON = /\b(he|she|him|her|his|hers|they|them|their|uska|uski|unka|unki|isne|usne|woh|wo|yeh|ye|candidate)\b/;
const ATTR = [
  ["experience", /(experience|years|saal|anubhav|\bexp\b)/],
  ["location", /(location|where|kahan|city|based|rehta|rehti)/],
  ["role", /(role|designation|position|kya karta|kya karti|profession|title)/],
  ["skills", /(skill|expertise|good at|kya aata)/],
  ["proof", /(proof|evidence|video|photo|media)/],
  ["companies", /(compan|worked|organi[sz]ation|kahan kaam|employer)/],
];

function attrAnswer(kind, c) {
  const n = c.name;
  const y = yrs(c.experience);
  switch (kind) {
    case "experience": return y ? L(`${n} has ${y} years of experience.`, `${n} ke paas ${y} saal ka experience hai.`) : L(`${n} hasn't added years of experience yet.`, `${n} ne abhi experience ke saal add nahi kiye.`);
    case "location": return c.location ? L(`${n} is based in ${c.location}.`, `${n} ${c.location} me hain.`) : L(`${n} hasn't added a location yet.`, `${n} ne abhi location add nahi ki.`);
    case "role": return L(`${n} works as ${c.role}.`, `${n} ka role ${c.role} hai.`);
    case "skills": return c.skills?.length ? L(`${n}'s skills: ${c.skills.join(", ")}.`, `${n} ki skills: ${c.skills.join(", ")}.`) : L(`${n} hasn't listed skills yet.`, `${n} ne abhi skills list nahi ki.`);
    case "proof": return L(`${n} has ${c.proofCount || 0} proof item${c.proofCount === 1 ? "" : "s"} attached.`, `${n} ke ${c.proofCount || 0} proof items attached hain.`);
    case "companies": return c.companies?.length ? L(`${n} has worked at ${c.companies.join(", ")}.`, `${n} ne ${c.companies.join(", ")} me kaam kiya hai.`) : L(`${n} hasn't added companies yet.`, `${n} ne abhi companies add nahi ki.`);
    default: return null;
  }
}

const followup = {
  id: "followup", priority: 90,
  run(ctx) {
    const { norm, session } = ctx;
    const list = session.lastResults || [];
    const target = session.selectedCandidate || list[0] || null;
    const sel = session.selectedCandidate || (list.length === 1 ? list[0] : null);

    const o = ordinal(norm);
    if (!list.length && o !== null && /(one|candidate|profile|wala|wale|waala)\b/.test(norm) && /(show|open|view|dikhao|kholo|select|dekho)/.test(norm)) {
      return { text: L("I haven't shown any results yet. Describe who you need first, then I can open one.", "Maine abhi koi result nahi dikhaya. Pehle bataiye kaun chahiye, phir main ek khol dungi.") };
    }
    if (list.length && o !== null && /(one|candidate|profile|wala|wale|waala|show|open|view|dikhao|kholo|select|dekho)/.test(norm)) {
      const c = o === -1 ? list[list.length - 1] : list[o];
      if (!c) return { text: L(`I only found ${list.length} profile${list.length > 1 ? "s" : ""}.`, `Mujhe sirf ${list.length} profile mile the.`) };
      mem.saveMemory({ lastOpened: { name: c.name, at: Date.now() } });
      return { text: L(`Opening ${c.name}'s PDP.`, `${c.name} ka PDP khol rahi hoon.`), session: { selectedCandidate: c, lastIntent: "open_candidate" }, actions: [{ type: "navigate", url: c.url || "/pdp/me" }] };
    }

    if (/\bshortlist\b|save (him|her|them|this)|add to (the )?list/.test(norm) && !QUESTION.test(norm)) {
      if (!target) return { text: L("Search first, then I can shortlist.", "Pehle search karo, phir shortlist kar dungi.") };
      return { text: L(`Shortlisted ${target.name}.`, `${target.name} ko shortlist kar diya.`), actions: [{ type: "event", name: "pdp-pal:shortlist", detail: { name: target.name } }], session: { selectedCandidate: target } };
    }

    if (/\b(open|view|proof|dikhao|kholo)\b/.test(norm) && wordCount(norm) <= 5 && !QUESTION.test(norm) && /(his|her|their|uska|uski|pdp|profile|proof|it)\b/.test(norm)) {
      if (!target) return { text: L("Search first, then I can open a profile.", "Pehle search karo, phir profile khol dungi.") };
      mem.saveMemory({ lastOpened: { name: target.name, at: Date.now() } });
      return { text: L(`Opening ${target.name}'s PDP.`, `${target.name} ka PDP khol rahi hoon.`), session: { selectedCandidate: target }, actions: [{ type: "navigate", url: target.url || "/pdp/me" }] };
    }

    if (sel && !/(how (do|can|to) i|kaise)\b/.test(norm) && (PRON.test(norm) || wordCount(norm) <= 3)) {
      for (const [kind, re] of ATTR) if (re.test(norm)) return { text: attrAnswer(kind, sel), session: { selectedCandidate: sel } };
    }
    return null;
  },
};

/* =============== 80 · recruiter search =============== */
const SEARCH_VERBS = /\b(need|looking for|look for|hire|hiring|require|required|chahiye|chaiye|dhundh|dhoondh|find me|search for)\b/;

function searchLike(ctx) {
  const tokens = tokenize(ctx.norm);
  if (!tokens.length) return false;
  if (SEARCH_VERBS.test(ctx.norm)) return true;
  if (ctx.page !== "recruiter") return false;
  if (QUESTION.test(ctx.norm) || ctx.raw.trim().endsWith("?")) return false;
  return tokens.length >= 2 || yearsOf(ctx.norm) !== null || tokens.some((t) => t in { sales: 1, designer: 1, design: 1, developer: 1, engineer: 1, marketing: 1, teacher: 1, fmcg: 1 });
}

const search = {
  id: "search", priority: 80,
  async run(ctx) {
    if (!searchLike(ctx)) return null;
    const need = yearsOf(ctx.norm);
    const tokens = tokenize(ctx.norm);
    const profiles = await loadProfiles();

    if (!profiles.length) {
      return { text: L("There are no live PDP profiles yet. Once candidates create profiles, I can search them here.", "Abhi koi live PDP profile nahi hai. Candidates profile banayenge to main yahan search kar dungi."), links: [link("/upload-resume", "Create a profile", "Profile banao")] };
    }
    if (!tokens.length && need === null) {
      return { text: L("Give me a bit more detail — role, skill or location. For example “product designer 8 years Bengaluru”.", "Thoda detail do — role, skill ya location. Jaise “product designer 8 saal Bengaluru”.") };
    }

    let tooJunior = false;
    const results = profiles
      .map((p) => {
        const hay = (p.haystack || "").toLowerCase();
        const hits = tokens.filter((t) => expand(t).some((w) => hay.includes(w)));
        const ratio = tokens.length ? hits.length / tokens.length : 1;
        const py = parseFloat(p.experience);
        const lowExp = need !== null && !Number.isNaN(py) && py < need;
        return { p, hits, ratio, lowExp };
      })
      .filter((r) => { if (r.ratio < 0.5) return false; if (r.lowExp) { tooJunior = true; return false; } return true; })
      .sort((a, b) => b.ratio - a.ratio);

    mem.rememberSearch(ctx.raw.trim());
    const syncEvent = { type: "event", name: "pdp-pal:search", detail: { text: ctx.raw.trim() } };

    if (!results.length) {
      return {
        text: tooJunior
          ? L(`The role matches, but the experience is below ${need}+ years. Try a lower number.`, `Role match hai, lekin experience ${need}+ saal se kam hai. Number thoda kam karke try karo.`)
          : L("No match found. Try different keywords, like the role or skill name.", "Koi match nahi mila. Keywords badal ke try karo, jaise role ya skill ka naam."),
        session: { lastIntent: "candidate_search", lastQuery: ctx.raw.trim(), lastResults: [], selectedCandidate: null },
        actions: [syncEvent],
      };
    }

    const first = results[0];
    const n = results.length;
    const matched = first.hits.length ? first.hits.join(", ") : "";
    const proofEn = first.p.proofCount ? ` ${first.p.proofCount} proof items attached.` : " No proof media attached yet.";
    const proofHi = first.p.proofCount ? ` ${first.p.proofCount} proof items attached hain.` : " Abhi proof media attach nahi hui.";
    return {
      text: L(`Found ${n} profile${n > 1 ? "s" : ""}.${matched ? ` Matched: ${matched}.` : ""}${proofEn} Only live PDP profiles are shown.`,
              `${n} profile${n > 1 ? "s" : ""} mile.${matched ? ` Match: ${matched}.` : ""}${proofHi} Sirf live PDP profiles dikha rahi hoon.`),
      cards: results.map((r) => card(r.p)),
      chips: [chip("Open the first one", "Pehla kholo", "open the first one"), chip("Shortlist", "Shortlist karo", "shortlist")],
      links: ctx.page === "recruiter" ? [] : [link("/recruiters", "Open Discover Talent", "Discover Talent kholo")],
      session: { lastIntent: "candidate_search", lastQuery: ctx.raw.trim(), lastResults: results.map((r) => card(r.p)), selectedCandidate: null },
      actions: [syncEvent],
    };
  },
};

/* =============== 70 · profile context =============== */
const profileSrc = {
  id: "profile", priority: 70,
  async run(ctx) {
    const { norm, page } = ctx;
    const mine = /\b(my|mera|meri|mere|apna|apni)\b/.test(norm);
    if (!(page === "profile" || mine)) return null;
    if (/^(how|can i|where do i|where can i|kaise)\b/.test(norm) && !/how much|how many|kitna|kitne/.test(norm)) return null;

    const attrKind = ATTR.find(([, re]) => re.test(norm))?.[0];
    const { draft: d, mediaCount } = await loadMyProfile();
    const exps = d.experience || [];
    const companyHit = exps.find((e) => {
      const key = String(e.company || "").toLowerCase();
      return key && (norm.includes(key) || norm.split(" ").some((w) => w.length >= 3 && key.split(" ")[0] === w));
    });
    if (!companyHit && !attrKind) return null;

    if (!d.name || !d.role) {
      return { text: L("This profile is still empty. Upload your resume and add your name and role first.", "Ye profile abhi khali hai. Pehle resume upload karo aur naam aur role bharo."), links: [link("/upload-resume", "Upload resume", "Resume upload karo")] };
    }
    const who = d.name;

    if (companyHit) {
      const e = companyHit;
      const when = e.years ? ` (${e.years})` : "";
      return {
        text: L(`At ${e.company}, ${who} works as ${e.role}${when}. ${e.highlight || e.desc || ""}`.trim(), `${e.company} me ${who} ka role ${e.role} hai${when}. ${e.highlight || e.desc || ""}`.trim()),
        actions: page === "profile" ? [{ type: "event", name: "pdp-pal:focus-experience", detail: { company: e.company } }] : [],
        links: page === "profile" ? [] : [link("/pdp/me", "Open my PDP", "Mera PDP kholo")],
      };
    }
    const c = { name: who, role: d.role, location: d.location, experience: d.stats?.experience, skills: d.skills || [], companies: exps.map((e) => e.company), proofCount: mediaCount };
    const text = attrAnswer(attrKind, c);
    return text ? { text } : null;
  },
};

/* =============== 60 · coach (real profile state) =============== */
const coach = {
  id: "coach", priority: 60,
  async run(ctx) {
    if (!/(next step|what next|what should i do|what do i do next|kya karun|kya karna|aage kya|checklist|profile (strength|complete|score|status)|how complete|improve my|tips)/.test(ctx.norm)) return null;
    const { draft: d, mediaCount } = await loadMyProfile();
    const a = await getAssets();
    const items = [
      [!!(d.name && d.role), L("Name & role", "Naam aur role"), "/upload-resume"],
      [a.resume, L("Resume", "Resume"), "/upload-resume"],
      [a.intro, L("Career intro video", "Career intro video"), "/build-proof"],
      [mediaCount > 0, L(`Proof of work (${mediaCount})`, `Proof of work (${mediaCount})`), "/build-proof"],
      [(d.experience || []).length > 0, L("Companies linked to your work", "Work se jude companies"), "/build-proof"],
    ];
    const missing = items.find((i) => !i[0]);
    return {
      text: (lang) => {
        const lines = items.map(([ok, label]) => `${ok ? "✓" : "○"} ${pick(label, lang)}`).join("\n");
        const tail = missing
          ? (lang === "en" ? `\nNext: add your ${pick(missing[1], lang).toLowerCase()}.` : `\nAgla step: apna ${pick(missing[1], lang).toLowerCase()} add karo.`)
          : (lang === "en" ? "\nYour profile looks complete — preview it and share your link." : "\nAapka profile complete lag raha hai — preview karo aur link share karo.");
        return `${lines}${tail}`;
      },
      links: [missing ? link(missing[2], "Go there", "Wahan jao") : link("/pdp/me", "Preview my PDP", "Mera PDP dekho")],
    };
  },
};

/* =============== 50 · knowledge =============== */
const knowledge = {
  id: "knowledge", priority: 50,
  run(ctx) {
    const m = matchKnowledge(ctx.norm, ctx.page);
    if (m.entry) {
      const a = typeof m.entry.a === "function" ? m.entry.a(ctx) : m.entry.a;
      return { text: a, links: m.entry.links || [] };
    }
    if (m.suggest?.length) {
      return {
        text: L("I'm not sure I got that. Did you mean:", "Pakka samajh nahi aaya. Kya aap ye poochna chahte the:"),
        chips: m.suggest.map((e) => ({ label: e.q, send: e.keywords[0] })),
      };
    }
    return null;
  },
};

/* =============== 0 · fallback =============== */
const fallback = {
  id: "fallback", priority: 0,
  run(ctx) {
    mem.logUnanswered(ctx.raw.trim(), ctx.page);
    return {
      text: L("I'm PDP Pal, so I know PDP really well — how it works, building your profile, proof of work and finding professionals. I don't have enough information to answer that reliably.",
              "Main PDP Pal hoon, isliye PDP ke baare me achhe se jaanti hoon — ye kaise kaam karta hai, profile banana, proof of work aur professionals dhundhna. Is sawal ka bharosemand jawab mere paas nahi hai."),
      chips: (PAGE_SUGGESTIONS[ctx.page] || PAGE_SUGGESTIONS.home).slice(0, 3),
    };
  },
};

[control, followup, search, profileSrc, coach, knowledge, fallback].forEach(registerSource);
