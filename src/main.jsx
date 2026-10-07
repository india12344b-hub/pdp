import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import shieldIcon from "./pdp-shield.png";
import ProfessionalsPage from "./ProfessionalsPage";
import PdpProfilePage from "./PdpProfilePage";
import RecruiterPage from "./RecruiterPage";
import RecruiterLoginPage from "./RecruiterLoginPage";
import RecruiterSubscriptionPage from "./RecruiterSubscriptionPage";
import Nexus9Page from "./Nexus9Page";
import RecruiterCandidatesPage from "./RecruiterCandidatesPage";
import ProofOfWorkPage from "./ProofOfWorkPage";
import ResumeUploadPage from "./ResumeUploadPage";
import ProfessionalLoginPage from "./ProfessionalLoginPage";
import PdpPal from "./PdpPal";
import "./styles.css";
import "./professionals.css";
import "./pdpProfile.css";
import "./recruiterLanding.css";

// Browser-tab icon: use only the PDP shield for a clean favicon at small sizes.
const favicon = document.querySelector('link[rel="icon"]') || document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/png";
favicon.href = shieldIcon;
if (!favicon.parentNode) document.head.appendChild(favicon);

const pathname = window.location.pathname.replace(/\/$/, "") || "/";
const isProfessionalsPage = pathname === "/professionals";
const isProfessionalLoginPage = pathname === "/professional-login" || pathname === "/login" || pathname === "/signup";
const isPdpPage = pathname === "/pdp" || pathname === "/pdp/me";
const isRecruiterPage = pathname === "/recruiters";
const isNexus9Page = pathname === "/recruiters/nexus-9" || pathname === "/recruiters/nexus9" || pathname === "/nexus-9";
const isRecruiterCandidatesPage = pathname === "/recruiters/candidates";
const isRecruiterLoginPage = pathname === "/recruiters/login" || pathname === "/recruiter-login";
const isRecruiterSubscriptionPage = pathname === "/recruiters/subscription" || pathname === "/recruiter-subscription" || pathname === "/recruiters/pricing";
const isCandidateMediaPage = pathname === "/build-proof" || pathname === "/candidate-media";
const isResumePage = pathname === "/upload-resume" || pathname === "/resume" || pathname === "/create";
const reservedPaths = new Set(["/", "/professionals", "/professional-login", "/login", "/signup", "/pdp", "/pdp/me", "/recruiters", "/recruiters/nexus-9", "/recruiters/nexus9", "/nexus-9", "/recruiters/candidates", "/recruiters/login", "/recruiter-login", "/recruiters/subscription", "/recruiter-subscription", "/recruiters/pricing", "/build-proof", "/candidate-media", "/upload-resume", "/resume", "/create"]);
const isPublicPdpPage = !reservedPaths.has(pathname) && /^\/[a-z0-9][a-z0-9-]{2,39}$/i.test(pathname);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isProfessionalLoginPage ? <ProfessionalLoginPage /> : isProfessionalsPage ? <ProfessionalsPage /> : isPdpPage || isPublicPdpPage ? <PdpProfilePage /> : isRecruiterSubscriptionPage ? <RecruiterSubscriptionPage /> : isRecruiterLoginPage ? <RecruiterLoginPage /> : isNexus9Page ? <Nexus9Page /> : isRecruiterCandidatesPage ? <RecruiterCandidatesPage /> : isRecruiterPage ? <RecruiterPage /> : isCandidateMediaPage ? <ProofOfWorkPage /> : isResumePage ? <ResumeUploadPage /> : <App />}
    <PdpPal />
  </React.StrictMode>
);
