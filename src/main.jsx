import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import shieldIcon from "./pdp-shield.png";
import ProfessionalsPage from "./ProfessionalsPage";
import PdpProfilePage from "./PdpProfilePage";
import RecruiterPage from "./RecruiterPage";
import ProofOfWorkPage from "./ProofOfWorkPage";
import ResumeUploadPage from "./ResumeUploadPage";
import "./styles.css";
import "./professionals.css";
import "./pdpProfile.css";

// Browser-tab icon: use only the PDP shield for a clean favicon at small sizes.
const favicon = document.querySelector('link[rel="icon"]') || document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/png";
favicon.href = shieldIcon;
if (!favicon.parentNode) document.head.appendChild(favicon);

const pathname = window.location.pathname.replace(/\/$/, "") || "/";
const isProfessionalsPage = pathname === "/professionals";
const isPdpPage = pathname === "/pdp" || pathname === "/pdp/me";
const isRecruiterPage = pathname === "/recruiters";
const isCandidateMediaPage = pathname === "/build-proof" || pathname === "/candidate-media";
const isResumePage = pathname === "/upload-resume" || pathname === "/resume" || pathname === "/create";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isProfessionalsPage ? <ProfessionalsPage /> : isPdpPage ? <PdpProfilePage /> : isRecruiterPage ? <RecruiterPage /> : isCandidateMediaPage ? <ProofOfWorkPage /> : isResumePage ? <ResumeUploadPage /> : <App />}
  </React.StrictMode>
);