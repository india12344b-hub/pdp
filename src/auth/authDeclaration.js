/*
  Originality declaration + consent record.
  The canonical (English) wording below is what gets stored in the record, together with its version, so a record
  always shows exactly what the professional agreed to. Hinglish text is a display aid only.
  Uploads need the full declaration. Live PDP-camera captures only need the real-work + rights/consent statements
  (the camera itself already shows it is not an edited or pre-made file).
*/
export const DECLARATION_VERSION = "2026-10-v1";

export const STATEMENTS = [
  { id: "real-work", modes: ["upload", "live"], en: "This is real work I did, or a real moment I was part of.", hi: "Ye asli kaam hai jo maine kiya, ya ek asli moment jisme main shamil tha/thi." },
  { id: "not-ai", modes: ["upload"], en: "It was not created or substantially changed by AI.", hi: "Ye AI se nahi banaya gaya, na hi AI se bada badlav kiya gaya." },
  { id: "not-edited", modes: ["upload"], en: "It has not been edited to change what it shows. (Crop, brightness, trimming or compression is fine.)", hi: "Ise is tarah edit nahi kiya gaya ki wo kuch aur dikhaye. (Crop, brightness, trimming ya compression theek hai.)" },
  { id: "not-screen", modes: ["upload"], en: "It is not a photo of a screen, a printout, or someone else's work.", hi: "Ye kisi screen, printout ya kisi aur ke kaam ki photo nahi hai." },
  { id: "rights-consent", modes: ["upload", "live"], en: "I have the right to share it, and anyone clearly shown has agreed or cannot be identified.", hi: "Mujhe ise share karne ka haq hai, aur jo log saaf dikhte hain unki sehmati hai ya wo pehchane nahi ja sakte." },
  { id: "screening-consent", modes: ["upload", "live"], en: "I understand PDP screens uploads, may review them, and may remove proof that breaks these rules. PDP keeps this signed record.", hi: "Mujhe pata hai PDP uploads screen karta hai, review kar sakta hai, aur rules todne wala proof hata sakta hai. PDP ye signed record rakhta hai." },
];

export const statementsFor = (mode) => STATEMENTS.filter((s) => s.modes.includes(mode === "live" ? "live" : "upload"));

export const emptyDeclaration = () => ({ accepted: Object.fromEntries(STATEMENTS.map((s) => [s.id, false])), signedName: "", origin: "own", claimedTakenOn: "" });

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
