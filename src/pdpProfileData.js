import { IMAGES } from "./pdpMedia";

/*
  PDP profile data layer.
  UI components should consume this shape; future resume import / editor / database
  can populate the same structure without changing the public profile UI.
*/

export const ROLE_PROFILES = {
  "product-design": {
    category: "Product Design",
    title: "Product Designer",
    totalYears: 8,
    focusLabel: "Featured Work",
    sourceLabel: "ROLE + RESUME",
    sections: {
      projects: "Featured Work",
      proof: "Work Evidence",
      achievements: "Design Achievements",
      credentials: "Credentials",
      people: "People I Worked With",
      journey: "Career Journey",
    },
    snapshot: [
      { label: "Product Design", value: "8 yrs", detail: "Across XYZ Technologies, ABC Digital and Creative Labs", companies: ["XYZ Technologies", "ABC Digital", "Creative Labs"], relatedProjects: ["Smart Inventory System", "HealthTrack App", "eCommerce Platform"], relatedEvidence: ["Project Walkthrough", "Design Presentation"] },
      { label: "UX / Research", value: "7 yrs", detail: "User research, journeys, usability and product discovery", companies: ["XYZ Technologies", "ABC Digital", "NextGen Solutions"], relatedProjects: ["HealthTrack App", "eCommerce Platform"], relatedEvidence: ["Project Walkthrough", "Design Presentation"] },
      { label: "Design Systems", value: "5 yrs", detail: "Scalable UI systems and component libraries", companies: ["XYZ Technologies", "ABC Digital"], relatedProjects: ["Smart Inventory System"], relatedEvidence: ["Project Walkthrough"] },
      { label: "Leadership", value: "4 yrs", detail: "Mentoring designers and leading cross-functional work", companies: ["XYZ Technologies"], relatedProjects: ["Smart Inventory System"], relatedEvidence: ["Team Collaboration"] },
      { label: "Figma", value: "6 yrs", detail: "Advanced product design, prototyping and collaboration", companies: ["XYZ Technologies", "ABC Digital", "Creative Labs"], relatedProjects: ["Smart Inventory System", "HealthTrack App", "eCommerce Platform"], relatedEvidence: ["Design Presentation"] },
    ],
  },
  "sales": {
    category: "Sales",
    title: "Sales Leader",
    totalYears: 12,
    focusLabel: "Business Impact",
    sourceLabel: "ROLE + RESUME",
    sections: { projects: "Business Impact", proof: "Sales Evidence", achievements: "Sales Achievements", credentials: "Credentials", people: "People I Worked With", journey: "Career Journey" },
    snapshot: [
      { label: "Enterprise Sales", value: "10 yrs", detail: "Large-account and complex B2B sales across multiple companies" },
      { label: "Team Leadership", value: "7 yrs", detail: "Built, coached and managed high-performing sales teams" },
      { label: "FMCG", value: "8 yrs", detail: "Deep market and channel experience in FMCG" },
      { label: "Key Accounts", value: "9 yrs", detail: "Strategic account development and relationship management" },
      { label: "Revenue Growth", value: "8 yrs", detail: "New business, territory growth and GTM execution" },
    ],
  },
  "software-engineering": {
    category: "Software Engineering",
    title: "Software Engineer",
    totalYears: 9,
    focusLabel: "Featured Projects",
    sourceLabel: "ROLE + RESUME",
    sections: { projects: "Featured Projects", proof: "Technical Evidence", achievements: "Engineering Achievements", credentials: "Credentials", people: "People I Worked With", journey: "Engineering Journey" },
    snapshot: [
      { label: "Software Engineering", value: "9 yrs", detail: "Product and platform engineering across multiple organizations" },
      { label: "JavaScript / TypeScript", value: "8 yrs", detail: "Production web applications and services" },
      { label: "Cloud", value: "6 yrs", detail: "Cloud-native deployment, infrastructure and observability" },
      { label: "Architecture", value: "5 yrs", detail: "Scalable systems, APIs and technical design" },
      { label: "Team Leadership", value: "4 yrs", detail: "Mentoring engineers and leading technical delivery" },
    ],
  },
  "marketing": {
    category: "Marketing",
    title: "Marketing & Brand Leader",
    totalYears: 11,
    focusLabel: "Campaign Highlights",
    sourceLabel: "ROLE + RESUME",
    sections: { projects: "Campaign Highlights", proof: "Marketing Evidence", achievements: "Marketing Achievements", credentials: "Credentials", people: "People I Worked With", journey: "Marketing Journey" },
    snapshot: [
      { label: "Brand Development", value: "8 yrs", detail: "Brand strategy, positioning and identity across companies" },
      { label: "Digital Marketing", value: "9 yrs", detail: "Digital campaigns, content and performance marketing" },
      { label: "GTM", value: "7 yrs", detail: "Go-to-market planning, launches and market expansion" },
      { label: "Campaign Leadership", value: "8 yrs", detail: "Integrated campaigns across channels and teams" },
      { label: "Team Leadership", value: "5 yrs", detail: "Leading agencies, marketers and cross-functional teams" },
    ],
  },
  "education": {
    category: "Education",
    title: "Educator & Academic Professional",
    totalYears: 14,
    focusLabel: "Teaching Highlights",
    sourceLabel: "ROLE + RESUME",
    sections: { projects: "Teaching Highlights", proof: "Teaching Evidence", achievements: "Academic Achievements", credentials: "Credentials", people: "Students & Colleagues", journey: "Teaching Journey" },
    snapshot: [
      { label: "Teaching", value: "14 yrs", detail: "Classroom, mentoring and academic program experience" },
      { label: "Subject Expertise", value: "12 yrs", detail: "Deep subject teaching and curriculum experience" },
      { label: "Student Mentoring", value: "10 yrs", detail: "Guidance, mentoring and student development" },
      { label: "Academic Leadership", value: "6 yrs", detail: "Program, department or academic team leadership" },
      { label: "Digital Teaching", value: "5 yrs", detail: "Online learning, digital content and blended teaching" },
    ],
  },
};

export const PROFILE_DATA = {
  profile: {
    slug: "ananyasharma",
    name: "Ananya Sharma",
    verified: true,
    roleProfileId: "product-design",
    role: "Product Designer",
    location: "Bengaluru, India",
    email: "ananya@gmail.com",
    phone: "+91 98765 43210",
    pdpUrl: "pdp.com/ananyasharma",
    availability: "Available for opportunities",
    introduction: "I'm a product designer with 8+ years of experience creating user-centered digital experiences. I love turning complex problems into simple, intuitive solutions that make a real impact.",
    about: "I'm a product designer who believes in the power of user empathy, clean design and continuous learning. Over the years, I've worked on products that solve real problems and create meaningful impact.",
    skills: ["UI/UX Design", "Product Design", "Design Systems", "Figma", "User Research", "Prototyping"],
    stats: { experience: "8+", projects: 24, awards: 12, current: "Product Designer @ XYZ Technologies", specialization: "UX · Product · Design Systems" },
  },
  experience: [
    { company: "XYZ Technologies", role: "Product Designer", years: "2021 — Present · 4 years", desc: "Enterprise SaaS products focused on improving user experience and product growth.", highlight: "Led product design from discovery through delivery, including user research, scalable UI systems and cross-functional product decisions.", tags: ["Product", "UX", "Leadership"] },
    { company: "ABC Digital", role: "UI/UX Designer", years: "2018 — 2021 · 3 years", desc: "Designed user interfaces for web and mobile applications, working closely with product and engineering.", highlight: "Owned interface design, usability improvements and product collaboration across web and mobile experiences.", tags: ["UI/UX", "Research"] },
    { company: "Creative Labs", role: "Junior Designer", years: "2016 — 2018 · 2 years", desc: "Created visual designs and supported product design teams across projects and campaigns.", highlight: "Built visual design foundations, supported campaign work and developed early product-design skills across multiple briefs.", tags: ["Visual", "Brand"] },
    { company: "NextGen Solutions", role: "Design Intern", years: "2015 — 2016 · 1 year", desc: "Assisted in design research, wireframing and prototyping for digital products.", highlight: "Supported design research, wireframes and prototypes for digital products — the profile's structured role evidence remains visible even when no project media is uploaded.", tags: ["Research", "Prototype"] },
  ],
  projects: [
    { company: "XYZ Technologies", title: "Smart Inventory System", result: "Reduced stock errors by 28%", role: "Product Design", image: IMAGES.project1, evidence: ["Project walkthrough", "6 work photos"] },
    { company: "XYZ Technologies", title: "HealthTrack App", result: "Improved user engagement by 45%", role: "UX Design", image: IMAGES.project2, evidence: ["UX walkthrough", "4 work photos"] },
    { company: "ABC Digital", title: "eCommerce Platform", result: "Increased conversion rate by 32%", role: "Product Design", image: IMAGES.project3, evidence: ["Case study", "3 work photos"] },
  ],
  workEvidence: [
    { company: "XYZ Technologies", title: "Project Walkthrough", meta: "0:18", image: IMAGES.work1, type: "video" },
    { company: "XYZ Technologies", title: "Team Collaboration", meta: "12 photos", image: IMAGES.work2, type: "photos" },
    { company: "ABC Digital", title: "Design Presentation", meta: "5 photos", image: IMAGES.work3, type: "photos" },
  ],
  achievements: ["Best UX Award — Design Conference 2022", "Team Leadership — XYZ Technologies 2023", "Innovation Challenge Winner — Product Innovation 2021"],
  credentials: ["UX Design Certification — Google (Coursera) · 2021", "Bachelor of Design — NID · 2015", "Advanced Figma — Design System Course · 2020"],
  recommendations: [{ name: "Rohit Mehta", role: "Product Manager · XYZ Technologies", text: "Ananya is a dedicated and creative professional who consistently delivers high-quality work. She brings great energy and is a pleasure to work with." }],
  timeline: [["2015", "Education", "NID"], ["2016", "First Role", "Junior Designer"], ["2018", "Senior Designer", "ABC Digital"], ["2021", "Product Designer", "XYZ Technologies"], ["2025", "Current Role", "Product Designer"]],
  personal: [
    { title: "With Friends", text: "Weekend road trips, celebrations and the people who keep me grounded.", image: IMAGES.selfie2 },
    { title: "Family", text: "The people behind my values, resilience and perspective.", image: IMAGES.family },
    { title: "Outside Work", text: "Travel, photography, design inspiration and discovering new places.", image: IMAGES.selfie1 },
  ],
};

export const getRoleProfile = (profile) => {
  if (profile?.roleProfileId && ROLE_PROFILES[profile.roleProfileId]) return ROLE_PROFILES[profile.roleProfileId];

  const text = [profile?.role, ...(profile?.skills || []), profile?.about].filter(Boolean).join(" ").toLowerCase();
  if (/sales|business development|account manager|revenue/.test(text)) return ROLE_PROFILES.sales;
  if (/software|developer|engineer|frontend|backend|full stack|devops|cloud/.test(text)) return ROLE_PROFILES["software-engineering"];
  if (/marketing|brand|growth|digital marketing|campaign/.test(text)) return ROLE_PROFILES.marketing;
  if (/teacher|educator|academic|professor|faculty|teaching/.test(text)) return ROLE_PROFILES.education;
  return ROLE_PROFILES["product-design"];
};
