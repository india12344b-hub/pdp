/*
  Originality declaration + consent record — one short paragraph, one tick, one signature.
  The canonical (English) wording is what gets stored in the record, with its version, so a record always shows exactly
  what the professional agreed to. The Hinglish text is a display aid only.
*/
export const DECLARATION_VERSION = "2026-10-v2";

export const FREEZE_WARNING = {
  en: "If AI-generated, edited or wrongly declared media is found, your PDP account will be frozen.",
  hi: "Agar AI-generated, edited ya galat declare kiya hua media mila, to aapka PDP account freeze kar diya jayega.",
};

const TEXT = {
  upload: {
    en: "I declare that this photo or video is real, unedited work that I created or have the right to share. It is not AI-generated or AI-altered, and it is not a photo of a screen, a printout or someone else's work. Anyone clearly shown has agreed or cannot be identified. I agree that PDP may screen and review it and keep this signed record.",
    hi: "Main ghoshit karta/karti hoon ki ye photo ya video asli, bina edit kiya hua kaam hai jo maine banaya ya jise share karne ka mujhe haq hai. Ye AI se nahi bana na AI se badla gaya, aur ye kisi screen, printout ya kisi aur ke kaam ki photo nahi hai. Jo log saaf dikhte hain unki sehmati hai ya wo pehchane nahi ja sakte. Main manta/manti hoon ki PDP ise screen aur review kar sakta hai aur ye signed record rakhta hai.",
  },
  live: {
    en: "I declare that I captured this myself, live, and that it shows real work or a real moment I was part of. I have the right to share it, and anyone clearly shown has agreed or cannot be identified. I agree that PDP may review it and keep this signed record.",
    hi: "Main ghoshit karta/karti hoon ki ye maine khud, live capture kiya hai aur ye asli kaam ya asli moment dikhata hai. Mujhe ise share karne ka haq hai, aur jo log saaf dikhte hain unki sehmati hai ya wo pehchane nahi ja sakte. Main manta/manti hoon ki PDP ise review kar sakta hai aur ye signed record rakhta hai.",
  },
};

export const statementsFor = (mode) => { const t = TEXT[mode === "live" ? "live" : "upload"]; return [{ id: "declaration", en: t.en, hi: t.hi }]; };
export const STATEMENTS = statementsFor("upload");

export const emptyDeclaration = () => ({ accepted: { declaration: false }, signedName: "", origin: "own", claimedTakenOn: "" });

const norm = (x) => String(x || "").toLowerCase().replace(/[^a-z\u0900-\u097f ]/g, "").replace(/\s+/g, " ").trim();

export function isDeclarationComplete(d, expectedName = "", mode = "upload") {
  if (!d) return false;
  if (!statementsFor(mode).every((s) => d.accepted?.[s.id])) return false;
  const name = norm(d.signedName);
  if (name.length < 3) return false;
  const expected = norm(expectedName);
  if (expected.length >= 3 && !/^your professional profile$/.test(expected)) {
    // the typed signature should match the profile name (first name is enough)
    if (!(name === expected || expected.includes(name) || name.includes(expected.split(" ")[0]))) return false;
  }
  return true;
}

export const ORIGINS = [
  { id: "own", en: "I took / made it myself", hi: "Maine khud khichi / banayi" },
  { id: "team", en: "My team or company gave it to me", hi: "Meri team ya company ne di" },
  { id: "other", en: "Other (I'll explain in the note)", hi: "Kuch aur (note me bataunga/bataungi)" },
];
