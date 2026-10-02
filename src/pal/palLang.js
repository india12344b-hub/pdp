/* PDP Pal — language helpers. Two languages: English ("en") and Hinglish ("hi"). */

export const LANGS = {
  en: { label: "English", speech: "en-IN" },
  hi: { label: "Hinglish", speech: "hi-IN" },
};

/* L(en, hi) → a bilingual text pair. Every user-facing string in Pal goes through this. */
export const L = (en, hi) => ({ en, hi: hi ?? en });

/* pick(value, lang) → string. value can be a string, an {en, hi} pair, or a function(lang). */
export function pick(v, lang = "en") {
  if (typeof v === "function") v = v(lang);
  if (v && typeof v === "object" && !Array.isArray(v)) return v[lang] ?? v.en ?? "";
  return v ?? "";
}

/* Speech recognition in Hindi returns Devanagari. Map the words Pal cares about to Latin. */
const DEV = {
  "सेल्स": "sales", "मैनेजर": "manager", "डिज़ाइनर": "designer", "डिजाइनर": "designer",
  "इंजीनियर": "engineer", "डेवलपर": "developer", "मार्केटिंग": "marketing", "टीचर": "teacher",
  "साल": "saal", "चाहिए": "chahiye", "मुझे": "mujhe", "दिल्ली": "delhi", "मुंबई": "mumbai",
  "बेंगलुरु": "bengaluru", "बैंगलोर": "bangalore", "गुड़गांव": "gurgaon", "पहला": "pehla",
  "दूसरा": "dusra", "तीसरा": "teesra", "शॉर्टलिस्ट": "shortlist", "प्रोफाइल": "profile",
  "मदद": "help", "नमस्ते": "namaste", "अनुभव": "anubhav", "एफएमसीजी": "fmcg",
  "कैंडिडेट": "candidate", "दिखाओ": "dikhao", "करो": "karo", "क्या": "kya", "कैसे": "kaise",
};

/* clean(text) → lowercase, Latin-only, punctuation-free string used for all matching. */
export function clean(text) {
  let s = String(text || "");
  for (const [k, v] of Object.entries(DEV)) s = s.split(k).join(` ${v} `);
  return s.toLowerCase().replace(/[^a-z0-9/&+\- ]/g, " ").replace(/\s+/g, " ").trim();
}

export const STOP = new Set([
  "i","need","want","looking","look","for","a","an","the","with","in","at","of","and","or","who","has","have","is","are",
  "me","find","show","give","candidate","candidates","profile","profiles","person","professional","years","year",
  "yrs","yr","experience","exp","chahiye","chaiye","mujhe","hai","ho","wala","wale","ka","ki","ke","mein","se",
  "ko","dikhao","dikha","do","karo","aur","koi","kuch","plus","min","minimum","saal","sal","to","on","from","please","pls",
  "hire","hiring","require","required","search","dhundh","dhoondh","urgent","my","can","you","it","this","that",
]);

export const SYN = {
  sales: ["sales", "business development", "revenue", "account"],
  designer: ["designer", "design", "ux", "ui"],
  design: ["design", "designer", "ux", "ui"],
  developer: ["developer", "engineer", "software"],
  engineer: ["engineer", "developer", "software"],
  marketing: ["marketing", "brand", "campaign", "growth"],
  teacher: ["teacher", "educator", "teaching", "academic"],
  fmcg: ["fmcg", "consumer goods", "fast moving"],
  ux: ["ux", "user experience", "research"],
  research: ["research", "ux", "usability"],
  leadership: ["leadership", "led", "team", "mentor"],
  distributor: ["distributor", "distribution", "channel"],
  gtm: ["gtm", "go-to-market", "go to market"],
  bangalore: ["bangalore", "bengaluru"],
  bengaluru: ["bangalore", "bengaluru"],
  mumbai: ["mumbai", "bombay"],
  gurgaon: ["gurgaon", "gurugram"],
  gurugram: ["gurgaon", "gurugram"],
};

export const expand = (t) => SYN[t] || [t];

export function tokenize(norm) {
  const words = String(norm || "").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+\+?$/.test(w));
  return [...new Set(words)];
}
