/*
  PDP Pal — knowledge base.
  Small, structured and organised by category. Entries are NOT a giant FAQ: each one is a topic with
  keywords, a page hint (Pal answers faster when the topic matches the page she is standing on),
  and a bilingual answer. An answer can also be a function, so it can read live PDP data.

  Add more with registerKnowledge([...]) from any other module.

  Convention: keywords[0] is always a full question phrase — it doubles as the "send" text for suggestion chips.
  TODO(owner): entries marked [confirm] state product facts to double-check before launch.
*/
import { L, clean } from "./palLang";
import { ROLE_PROFILES } from "../pdpProfileData";

const go = (url, en, hi) => ({ url, label: L(en, hi) });

export const KB = [
  /* ---------- PDP ---------- */
  { id: "what-is-pdp", cat: "PDP", pages: ["home", "professionals"], q: L("What is PDP?", "PDP kya hai?"),
    keywords: ["what is pdp", "pdp kya hai", "professional digital profile", "about pdp", "explain pdp", "pdp kya"],
    a: L("PDP (Professional Digital Profile) is a living professional profile. Instead of only listing claims on a resume, you attach real proof — a career video, work photos, projects — so recruiters can see the work behind your experience.",
         "PDP (Professional Digital Profile) ek living professional profile hai. Resume me sirf claims hote hain, yahan aap real proof — career video, work photos, projects — jodte ho, taaki recruiter kaam khud dekh sake.") },
  { id: "why-pdp", cat: "PDP", pages: ["home", "professionals"], q: L("Why PDP?", "PDP kyun?"),
    keywords: ["why pdp", "why use pdp", "benefits of pdp", "benefit", "advantage", "kyun use", "fayda", "better than resume", "different from resume"],
    a: L("A resume says what you did; PDP shows it. Your profile keeps the structure of a resume and adds real evidence, so recruiters spend less time guessing and more time seeing your actual work.",
         "Resume batata hai aapne kya kiya; PDP dikhata hai. Aapka profile resume jaisa structured rehta hai aur real evidence jodta hai, taaki recruiter andaza lagane ke bajaye aapka asli kaam dekhe.") },
  { id: "pdp-score", cat: "PDP", pages: ["profile", "proof", "professionals"], q: L("How is PDP Score calculated?", "PDP Score kaise calculate hota hai?"),
    keywords: ["pdp score", "score kaise", "score calculate", "how is my score", "my score", "pdp marks", "score", "marks"],
    a: L("PDP Score is out of 100. The strongest weight is live PDP camera proof, followed by declared original/unedited uploads, evidence volume, references/recommendations, and profile completeness. A declaration of originality is not the same as technical verification.",
         "PDP Score 100 me se hota hai. Sabse zyada weight live PDP camera proof ko milta hai, phir original/unedited upload declaration, proof ki quantity, references/recommendations aur profile completeness ko. Originality declaration technical verification nahi hai.") },
  { id: "how-works", cat: "PDP", pages: ["home", "professionals"], q: L("How does PDP work?", "PDP kaise kaam karta hai?"),
    keywords: ["how does pdp work", "how pdp works", "how it works", "pdp kaise kaam", "kaise kaam karta", "steps", "process"],
    a: L("Three steps: 1) upload your resume, 2) add Proof of Work — a career video plus photos and videos linked to your companies, 3) preview and share your PDP link. Recruiters then find you by experience and open your proof.",
         "Teen steps: 1) resume upload karo, 2) Proof of Work jodo — career video aur companies se jude photos/videos, 3) PDP preview karke link share karo. Recruiter phir experience se aapko dhundhte hain aur proof dekhte hain."),
    links: [go("/upload-resume", "Start with your resume", "Resume se shuru karo")] },
  { id: "who-can-use", cat: "PDP", pages: ["home", "professionals"], q: L("Who can use PDP?", "PDP kaun use kar sakta hai?"),
    keywords: ["who can use pdp", "kaun use kar sakta", "who is pdp for", "eligible", "which roles", "which sectors", "which industries", "professions"],
    a: () => {
      const cats = [...new Set(Object.values(ROLE_PROFILES).map((r) => r.category))].join(", ");
      return L(`PDP is for working professionals and for recruiters. Profiles are currently shaped around: ${cats} — and the list keeps growing.`,
               `PDP working professionals aur recruiters ke liye hai. Abhi profiles in areas ke hisaab se bante hain: ${cats} — aur list badh rahi hai.`);
    } },
  { id: "is-free", cat: "PDP", pages: ["home", "professionals"], q: L("Is PDP free?", "Kya PDP free hai?"),
    keywords: ["is pdp free", "pdp free hai", "free", "pricing", "price", "cost", "charges", "paid", "kitna paisa", "fees", "subscription"],
    a: L("PDP is free for professionals. I don't have recruiter pricing details yet.", "PDP professionals ke liye free hai. Recruiter pricing ki details abhi mere paas nahi hain.") }, // [confirm]
  { id: "create-profile", cat: "PDP", pages: ["home", "professionals", "resume"], q: L("How do I create a profile?", "Profile kaise banau?"),
    keywords: ["how do i create a profile", "profile kaise banau", "create profile", "create my profile", "make my profile", "build my profile", "get started", "sign up", "profile banana"],
    a: L("Start with Upload Resume and add your name, role and location. Then go to Proof of Work to attach videos and photos, and finally preview your PDP.",
         "Upload Resume se shuru karo aur naam, role, location bharo. Phir Proof of Work me videos/photos jodo, aur aakhir me apna PDP preview karo."),
    links: [go("/upload-resume", "Upload resume", "Resume upload karo")] },
  { id: "upload-resume", cat: "PDP", pages: ["resume"], q: L("How do I upload my resume?", "Resume kaise upload karun?"),
    keywords: ["how do i upload my resume", "resume kaise upload", "upload resume", "resume upload", "upload cv", "cv upload", "resume format", "pdf docx"],
    a: L("Upload your original resume as PDF, DOC or DOCX. Your original stays intact — PDP uses it as the source for your structured profile and does not rewrite factual claims. After uploading, enter your name, current role and location.",
         "Apna original resume PDF, DOC ya DOCX me upload karo. Original resume jaisa hai waisa rehta hai — PDP use source ki tarah leta hai aur factual claims badalta nahi. Upload ke baad naam, current role aur location bharo."),
    links: [go("/upload-resume", "Open resume step", "Resume step kholo")] },
  { id: "upload-proof", cat: "PDP", pages: ["proof"], q: L("How do I upload proof?", "Proof kaise upload karun?"),
    keywords: ["how do i upload proof", "proof kaise upload", "upload proof", "add proof", "proof upload", "add evidence", "upload evidence"],
    a: L("On the Proof of Work page: pick an experience area, optionally attach a company, add a short note about what the photo or video shows, then drop in your files. Videos should be about 20 seconds and you can add up to 20 photos. Everything saves automatically.",
         "Proof of Work page par: ek experience area chuno, chaaho to company attach karo, photo/video kya dikhata hai uska chhota note likho, phir files daalo. Videos lagbhag 20 second ke ho aur 20 tak photos add kar sakte ho. Sab kuch apne aap save hota hai."),
    links: [go("/build-proof", "Open Proof of Work", "Proof of Work kholo")] },
  { id: "what-is-pow", cat: "PDP", pages: ["professionals", "proof", "home"], q: L("What is Proof of Work?", "Proof of Work kya hai?"),
    keywords: ["what is proof of work", "proof of work kya", "proof of work", "what is proof", "pow"],
    a: L("Proof of Work is real evidence behind your claims — a career video, work photos and videos, project results, certificates and recommendations — attached to the company and experience area they belong to.",
         "Proof of Work aapke claims ke peeche ka real evidence hai — career video, work photos/videos, project results, certificates aur recommendations — jo us company aur experience area se jude hote hain.") },
  { id: "what-is-pal", cat: "PDP", pages: [], q: L("What is PDP Pal?", "PDP Pal kya hai?"),
    keywords: ["what is pdp pal", "pdp pal kya hai", "pdp pal", "who are you", "what are you", "tum kaun", "aap kaun", "your name", "what can you do", "kya kar sakti"],
    a: L("I'm PDP Pal, PDP's built-in guide. I can explain how PDP works, help professionals build their profile, and help recruiters search live profiles. I don't use an AI service, so I stay focused on PDP.",
         "Main PDP Pal hoon, PDP ki built-in guide. Main PDP samjha sakti hoon, professionals ko profile banane me aur recruiters ko live profiles search karne me madad karti hoon. Main kisi AI service ka use nahi karti, isliye PDP par focused rehti hoon.") },
  { id: "pdp-verified", cat: "PDP", pages: ["profile"], q: L("What is PDP Verified?", "PDP Verified kya hai?"),
    keywords: ["what is pdp verified", "pdp verified", "verified", "verification", "verify", "blue tick", "badge"],
    a: L("The tick next to a name marks a PDP profile that meets PDP's authenticity standards. The detailed verification rules are still being finalised.",
         "Naam ke saath ka tick us PDP profile ko dikhata hai jo PDP ke authenticity standards poore karta hai. Verification ke detailed rules abhi final ho rahe hain.") }, // [confirm]
  { id: "authenticity", cat: "Authenticity", pages: ["proof", "professionals"], q: L("How does authenticity work?", "Authenticity kaise kaam karti hai?"),
    keywords: ["how does authenticity work", "authenticity", "authentic", "genuine", "fake", "ai generated", "ai-generated", "edited photos", "edited", "photoshop", "original photos", "fraud"],
    a: L("PDP is built around genuine professional evidence. Professionals can upload existing work photos and videos, or capture new ones with the PDP camera, and must confirm that what they upload is authentic. AI-generated showcases are not allowed, and suspicious uploads may be reviewed.",
         "PDP genuine professional evidence par bana hai. Professionals purane work photos/videos upload kar sakte hain ya PDP camera se naye capture kar sakte hain, aur confirm karna hota hai ki upload authentic hai. AI-generated showcases allowed nahi hain, aur suspicious uploads review ho sakte hain.") }, // [confirm: PDP camera]
  { id: "privacy-memory", cat: "PDP", pages: [], q: L("What do you remember about me?", "Tum mere baare me kya yaad rakhti ho?"),
    keywords: ["what do you remember", "what do you remember about me", "do you remember me", "kya yaad", "your memory"],
    a: L("On this device I remember your language choice, your recent searches and the last profile you opened, so we can continue where you left off. Say “forget me” and I'll clear all of it.",
         "Is device par main aapki language, recent searches aur last khola hua profile yaad rakhti hoon, taaki hum wahin se aage badh sake. “Forget me” bolo to main sab clear kar dungi.") },
  { id: "privacy", cat: "PDP", pages: ["profile"], q: L("Is my data safe?", "Mera data safe hai?"),
    keywords: ["is my data safe", "mera data safe", "privacy", "private", "who can see my profile", "data safe", "secure"],
    a: L("You decide what goes on your PDP. The personal section is optional and only shows what you're comfortable sharing. For policy details, please check the Privacy Policy.",
         "Aapke PDP par kya jaayega ye aap tay karte ho. Personal section optional hai aur sirf wahi dikhata hai jo aap share karna chaho. Policy ki details ke liye Privacy Policy dekhein.") },

  /* ---------- Professionals ---------- */
  { id: "career-video", cat: "Professionals", pages: ["proof", "profile"], q: L("What is the career introduction video?", "Career introduction video kya hai?"),
    keywords: ["career introduction video", "career video", "career intro", "intro video", "introduction video", "video intro"],
    a: L("The Career Introduction is a short video in your own voice — around 45 seconds. Upload it on the Proof of Work page and it plays at the top of your PDP. Keep it natural.",
         "Career Introduction aapki apni awaaz me ek chhota video hai — lagbhag 45 second. Ise Proof of Work page par upload karo, ye aapke PDP ke top par chalega. Natural rakho."),
    links: [go("/build-proof", "Add career video", "Career video jodo")] },
  { id: "photos", cat: "Professionals", pages: ["proof"], q: L("What photos should I add?", "Kaunsi photos add karun?"),
    keywords: ["what photos should i add", "photos kaunsi", "work photos", "photos", "pictures", "which photos", "kaunsi photo"],
    a: L("Add genuine work moments — teams, events, client meetings, site work, launches, awards. You can add up to 20 photos, and each can be linked to a company with a short note on the context.",
         "Genuine work moments jodo — teams, events, client meetings, site work, launches, awards. 20 tak photos add kar sakte ho, har photo ko company se jod ke chhota context note likh sakte ho.") },
  { id: "videos", cat: "Professionals", pages: ["proof"], q: L("What videos should I add?", "Kaunse videos add karun?"),
    keywords: ["what videos should i add", "videos kaunse", "work videos", "project video", "demo video", "which videos"],
    a: L("Short clips of about 20 seconds — a project demo, a product walkthrough, a real process or a presentation. Link each to a company so recruiters see it under that experience.",
         "Lagbhag 20 second ke chhote clips — project demo, product walkthrough, real process ya presentation. Har clip ko company se jodo taaki recruiter use us experience ke neeche dekhe.") },
  { id: "projects", cat: "Professionals", pages: ["profile", "proof"], q: L("How do projects work?", "Projects kaise kaam karte hain?"),
    keywords: ["how do projects work", "projects kaise", "featured work", "case study", "case studies", "projects"],
    a: L("Projects appear as Featured Work on your PDP, with results and attached evidence. Photos and videos you add under a company show up in that company's section.",
         "Projects aapke PDP par Featured Work ki tarah dikhte hain, results aur attached evidence ke saath. Company ke under jo photos/videos jodte ho wo us company ke section me dikhte hain.") },
  { id: "personal-section", cat: "Professionals", pages: ["profile"], q: L("What is Know Me Beyond Work?", "Know Me Beyond Work kya hai?"),
    keywords: ["what is know me beyond work", "know me beyond work", "personal section", "personal side", "beyond work", "family section", "hobbies"],
    a: L("It's an optional section where you share the people and passions behind your profile — friends, family, interests — only what you're comfortable sharing. Visitors can expand or hide it.",
         "Ye ek optional section hai jahan aap apne profile ke peeche ke log aur shauk — dost, family, interests — share karte ho, sirf wahi jo aap chaho. Visitors ise kholte ya band kar sakte hain.") },
  { id: "share-profile", cat: "Professionals", pages: ["profile", "professionals"], q: L("How do I share my profile?", "Profile share kaise karun?"),
    keywords: ["how do i share my profile", "profile share kaise", "share profile", "share my pdp", "pdp link", "profile link", "share link", "qr", "share"],
    a: L("Every PDP gets one link, like pdp.mypdp.in/your-name. Use it on your resume, LinkedIn, email or WhatsApp.",
         "Har PDP ko ek link milta hai, jaise pdp.mypdp.in/your-name. Ise resume, LinkedIn, email ya WhatsApp par use karo.") },
  { id: "profile-id", cat: "Professionals", pages: ["profile"], q: L("What is my profile ID?", "Mera profile ID kya hai?"),
    keywords: ["what is my profile id", "profile id", "pdp id", "username", "custom url", "profile address"],
    a: L("Your PDP address is currently created from your name, for example pdp.mypdp.in/ananya-sharma. If you change the name, the address changes too.",
         "Aapka PDP address abhi aapke naam se banta hai, jaise pdp.mypdp.in/ananya-sharma. Naam badlo to address bhi badal jaata hai.") },
  { id: "edit-profile", cat: "Professionals", pages: ["resume", "proof", "profile"], q: L("How do I edit my profile?", "Profile edit kaise karun?"),
    keywords: ["how do i edit my profile", "profile edit kaise", "edit profile", "update profile", "change my name", "change details", "update details"],
    a: L("Update your name, role and location on the Resume page, and add or remove proof on the Proof of Work page. Changes save automatically.",
         "Naam, role aur location Resume page par badlo, aur proof Proof of Work page par add/remove karo. Changes apne aap save hote hain."),
    links: [go("/upload-resume", "Resume page", "Resume page"), go("/build-proof", "Proof of Work", "Proof of Work")] },
  { id: "company-link", cat: "Professionals", pages: ["proof"], q: L("How do I link evidence to a company?", "Evidence ko company se kaise jodun?"),
    keywords: ["how do i link evidence to a company", "link to company", "attach company", "connect evidence", "company attach", "experience area"],
    a: L("On Proof of Work, type the company name and press Attach, then upload. That evidence will show under that company in your Work Experience and Featured Work.",
         "Proof of Work par company ka naam likho aur Attach dabao, phir upload karo. Wo evidence aapke Work Experience aur Featured Work me us company ke neeche dikhega.") },

  /* ---------- Recruiters ---------- */
  { id: "find-professionals", cat: "Recruiters", pages: ["recruiter", "home"], q: L("How do I find professionals?", "Professionals kaise dhundhun?"),
    keywords: ["how do i find professionals", "professionals kaise dhundhun", "find professionals", "find talent", "discover talent", "find candidates", "talent kaise"],
    a: L("Open Discover Talent, describe the professional you need (or paste a job description) and press Search. PDP turns it into relevant experience areas and surfaces live PDP profiles.",
         "Discover Talent kholo, jis professional ki zarurat hai uska description likho (ya job description paste karo) aur Search dabao. PDP use relevant experience areas me badal ke live PDP profiles dikhata hai."),
    links: [go("/recruiters", "Discover Talent", "Discover Talent")] },
  { id: "search-candidates", cat: "Recruiters", pages: ["recruiter"], q: L("How do I search candidates?", "Candidates kaise search karun?"),
    keywords: ["how do i search candidates", "candidates kaise search", "search candidates", "candidate search", "how to search", "search kaise"],
    a: L("Just type the role, skill, experience and location in plain words — for example “FMCG sales manager 8 years Delhi” — here in chat, or use the mic. I'll match it against live profiles.",
         "Role, skill, experience aur location seedhe likho — jaise “FMCG sales manager 8 saal Delhi” — yahin chat me, ya mic use karo. Main use live profiles se match karungi.") },
  { id: "experience-filter", cat: "Recruiters", pages: ["recruiter"], q: L("How does experience matching work?", "Experience matching kaise hoti hai?"),
    keywords: ["how does experience matching work", "experience matching", "experience areas", "relevant experience", "filter by experience", "filters"],
    a: L("PDP organises each profile into experience areas — like Distributor Management or Design Systems — drawn from the person's role, resume and industry. Select an area to see the companies and evidence behind it.",
         "PDP har profile ko experience areas me baantta hai — jaise Distributor Management ya Design Systems — jo person ke role, resume aur industry se aate hain. Area chuno to uske peeche ki companies aur evidence dikhte hain.") },
  { id: "proof-recruiter", cat: "Recruiters", pages: ["recruiter"], q: L("How do I see a candidate's proof?", "Candidate ka proof kaise dekhun?"),
    keywords: ["how do i see a candidate's proof", "how do i see proof", "candidate ka proof", "see proof", "view proof", "check work", "verify work"],
    a: L("Open a profile to see the career video, project work and photos linked to each company — real evidence you can review before an interview.",
         "Profile kholo — har company se jude career video, project work aur photos dikhenge. Interview se pehle review karne ke liye real evidence.") },
  { id: "shortlist", cat: "Recruiters", pages: ["recruiter"], q: L("How do I shortlist a candidate?", "Candidate shortlist kaise karun?"),
    keywords: ["how do i shortlist", "shortlist kaise", "shortlisting", "save candidate", "add to shortlist"],
    a: L("Use Add to Shortlist on a candidate card, or just tell me “shortlist him” after a search.",
         "Candidate card par Add to Shortlist dabao, ya search ke baad mujhe bolo “shortlist karo”.") },
  { id: "contact", cat: "Recruiters", pages: ["recruiter", "profile"], q: L("How do I contact a candidate?", "Candidate se contact kaise karun?"),
    keywords: ["how do i contact a candidate", "contact kaise", "contact", "reach out", "connect with", "message candidate", "call candidate"],
    a: L("Every PDP has Contact, WhatsApp and Email actions, so you can reach the professional directly.",
         "Har PDP par Contact, WhatsApp aur Email actions hote hain, taaki aap professional se seedha baat kar sako.") },
  { id: "ask-this-pdp", cat: "Recruiters", pages: ["recruiter", "profile"], q: L("What is Ask this PDP?", "Ask this PDP kya hai?"),
    keywords: ["what is ask this pdp", "ask this pdp", "ask pdp", "ask about a candidate", "ask a question about candidate", "question about candidate"],
    a: L("Ask this PDP lets you ask questions about one professional — like “Has she handled distributor management?” — and get answers pulled only from that person's documented experience and proof, with the evidence shown. If something isn't documented, it says so instead of guessing.",
         "Ask this PDP se aap ek professional ke baare me sawal pooch sakte ho — jaise “Kya unhone distributor management handle kiya hai?” — aur jawab sirf unke documented experience aur proof se aata hai, evidence ke saath. Jo documented nahi hota, uske liye wo andaza nahi lagata, saaf bata deta hai.") },
  { id: "job-requirements", cat: "Recruiters", pages: ["recruiter"], q: L("Can I paste a job description?", "Kya job description paste kar sakta hoon?"),
    keywords: ["can i paste a job description", "paste jd", "job description", "jd", "job requirement", "requirement box"],
    a: L("Yes. Paste a JD or describe the role in the requirement box. PDP maps it to relevant experience areas, and you can switch each filter on or off.",
         "Haan. Requirement box me JD paste karo ya role describe karo. PDP use relevant experience areas se map karta hai, aur har filter on/off kar sakte ho.") },

  /* ---------- Pal itself ---------- */
  { id: "language-voice", cat: "PDP", pages: [], q: L("How do I change language?", "Language kaise badlun?"),
    keywords: ["how do i change language", "language kaise", "change language", "voice", "mic", "microphone", "speak to you"],
    a: L("Use the English / Hinglish switch in my header. The mic follows the same language. Voice input works best in Chrome or Edge.",
         "Mere header me English / Hinglish switch use karo. Mic bhi usi language me sunta hai. Voice input Chrome ya Edge me sabse achha chalta hai.") },
];

export function registerKnowledge(entries) { entries.forEach((e) => { if (!KB.some((k) => k.id === e.id)) KB.push(e); }); }

/* Suggestion chips shown under the chat, per page. `send` is what Pal "hears" when tapped. */
const S = (en, hi, send) => ({ label: L(en, hi), send });
export const PAGE_SUGGESTIONS = {
  home: [S("What is PDP?", "PDP kya hai?", "what is pdp"), S("How does PDP work?", "PDP kaise kaam karta hai?", "how does pdp work"), S("Is PDP free?", "Kya PDP free hai?", "is pdp free")],
  professionals: [S("What is PDP?", "PDP kya hai?", "what is pdp"), S("Create my profile", "Profile banao", "how do i create a profile"), S("What is Proof of Work?", "Proof of Work kya hai?", "what is proof of work"), S("Is it authentic?", "Authenticity?", "how does authenticity work")],
  resume: [S("How do I upload my resume?", "Resume kaise upload karun?", "how do i upload my resume"), S("What next?", "Aage kya?", "what should i do next"), S("What is Proof of Work?", "Proof of Work kya hai?", "what is proof of work")],
  proof: [S("How do I upload proof?", "Proof kaise upload karun?", "how do i upload proof"), S("What photos should I add?", "Kaunsi photos?", "what photos should i add"), S("How does authenticity work?", "Authenticity?", "how does authenticity work"), S("What next?", "Aage kya?", "what should i do next")],
  profile: [S("How do I share my profile?", "Profile share kaise karun?", "how do i share my profile"), S("Has he worked in FMCG?", "Kya FMCG me kaam kiya?", "has he worked in fmcg"), S("Tell me about this candidate", "Is candidate ke baare me batao", "tell me about this candidate"), S("What should I do next?", "Aage kya karun?", "what should i do next")],
  recruiter: [S("FMCG sales manager 5 years", "FMCG sales manager 5 saal", "fmcg sales manager 5 years"), S("Product designer", "Product designer", "product designer"), S("What is Ask this PDP?", "Ask this PDP kya hai?", "what is ask this pdp")],
};

/* ---------- matching ---------- */
const QSTOP = new Set(["how","what","do","does","i","a","is","my","can","to","you","the","of","me","kya","kaise","hai","ho","karun","karte","hain"]);
KB.forEach((e) => { e.qWords = clean(e.q.en).split(" ").filter((w) => w && !QSTOP.has(w)); });

function score(e, norm, words, page) {
  let s = 0;
  for (const k of e.keywords) {
    const kw = k.split(" ");
    if (kw.length > 1) {
      if ((" " + norm + " ").includes(" " + k + " ")) s += 3;
      else if (kw.every((w) => words.has(w))) s += 2;
    } else if (words.has(k)) s += 2;
  }
  for (const w of e.qWords || []) if (words.has(w)) s += 0.5;
  if (s > 0 && e.pages?.includes(page)) s += 1.5;
  return s;
}

export function matchKnowledge(norm, page) {
  const words = new Set(norm.split(" "));
  const ranked = KB.map((e) => ({ e, s: score(e, norm, words, page) })).filter((x) => x.s >= 1.5).sort((a, b) => b.s - a.s);
  if (ranked[0] && ranked[0].s >= 3) return { entry: ranked[0].e };
  if (ranked.length) return { suggest: ranked.slice(0, 2).map((x) => x.e) };
  return {};
}
