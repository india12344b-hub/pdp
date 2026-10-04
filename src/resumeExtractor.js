import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth/mammoth.browser";

// Set worker source compatible with Vite and pdfjs-dist v4+
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;

const clean = (s = "") => s.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
const linesOf = text => text.split(/\r?\n/).map(clean).filter(Boolean);
const firstMatch = (text, re) => { const m = text.match(re); return m ? clean(m[1] || m[0]) : ""; };

function normalisePhone(value) { return clean(value).replace(/[|]/g, ""); }

function extractFields(text) {
  const lines = linesOf(text);
  const joined = lines.join("\n");
  const email = firstMatch(joined, /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  const phone = firstMatch(joined, /(\+?\d[\d\s().-]{8,}\d)/);

  const labelled = (labels) => {
    const re = new RegExp(`^(?:${labels.join("|")})\\s*[:\\-]\\s*(.+)$`, "i");
    return lines.find(l => re.test(l))?.match(re)?.[1]?.trim() || "";
  };

  const address = labelled(["address", "permanent address", "current address", "residential address"]);
  const location = labelled(["location", "city", "current location", "based in", "address"]);
  const role = labelled(["current role", "designation", "job title", "title", "profile", "professional title"]);

  let name = labelled(["name", "full name"]);
  if (!name) {
    const bad = /resume|curriculum|cv|profile|objective|summary|experience|education|skills|contact|email|phone|mobile|address|linkedin|github/i;
    name = lines.slice(0, 12).find(l => {
      if (l.length < 3 || l.length > 70 || bad.test(l) || /@|\d{4,}/.test(l)) return false;
      const words = l.split(/\s+/);
      return words.length >= 2 && words.length <= 6 && words.every(w => /^[A-Za-z.'-]+$/.test(w));
    }) || "";
  }

  let inferredLocation = location;
  if (!inferredLocation && address) inferredLocation = address;
  if (!inferredLocation) {
    const indiaCity = lines.find(l => /\b(Delhi|Mumbai|Bengaluru|Bangalore|Hyderabad|Chennai|Pune|Jaipur|Gurugram|Gurgaon|Noida|Kolkata|Ahmedabad|Indore|Lucknow|Chandigarh|Bhiwadi|Faridabad)\b/i.test(l));
    inferredLocation = indiaCity || "";
  }

  let inferredRole = role;
  if (!inferredRole && name) {
    const start = Math.max(0, lines.indexOf(name));
    inferredRole = lines.slice(start + 1, start + 7).find(l => /manager|director|executive|engineer|developer|designer|analyst|consultant|teacher|professor|sales|marketing|hr|human resources|accountant|finance|operations|founder|entrepreneur|specialist|lead|officer|coordinator|administrator/i.test(l) && l.length < 100) || "";
  }

  const experienceYears = firstMatch(joined, /(?:total\s+)?(?:experience|work experience)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:\+\s*)?(?:years?|yrs?)/i);
  const skillsLine = labelled(["skills", "technical skills", "core skills", "key skills"]);
  const linkedin = firstMatch(joined, /(https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+)/i);

  return {
    name,
    email,
    phone: normalisePhone(phone),
    location: inferredLocation,
    address,
    role: inferredRole,
    linkedin,
    skills: skillsLine ? skillsLine.split(/[,|•·]/).map(clean).filter(Boolean).slice(0, 30) : [],
    stats: { experience: experienceYears || "" },
  };
}

async function pdfText(file) {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str || "").join(" "));
  }
  return pages.join("\n");
}

async function docxText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
}

export async function extractResume(file) {
  if (!file) throw new Error("No resume selected.");
  let text = "";
  const type = (file.type || "").toLowerCase();
  if (type === "application/pdf" || /\.pdf$/i.test(file.name)) text = await pdfText(file);
  else if (type.includes("wordprocessingml") || /\.docx$/i.test(file.name)) text = await docxText(file);
  else if (type === "application/msword" || /\.doc$/i.test(file.name)) throw new Error("Old .DOC files can be saved as PDF or DOCX for automatic extraction.");
  else throw new Error("Unsupported resume format.");
  if (!text.trim()) throw new Error("PDP could not read text from this resume. Please use a text-based PDF/DOCX or enter the details manually.");
  return { ...extractFields(text), extractedText: text.slice(0, 30000) };
}