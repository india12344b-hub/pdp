import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ProfessionalsPage from "./ProfessionalsPage";
import PdpProfilePage from "./PdpProfilePage";
import RecruiterPage from "./RecruiterPage";
import ProofOfWorkPage from "./ProofOfWorkPage";
import ResumeUploadPage from "./ResumeUploadPage";
import "./styles.css";
import "./professionals.css";
import "./pdpProfile.css";

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
