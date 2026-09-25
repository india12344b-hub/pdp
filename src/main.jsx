import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Page2 from "./Page2";
import Page3 from "./Page3";
import "./styles.css";
import "./page2.css";
import "./page3.css";

const pathname = window.location.pathname.replace(/\/$/, "") || "/";
const isProfessionalsPage = pathname === "/professionals";
const isDemoPdpPage = pathname === "/pdp" || pathname === "/pdp/ananya" || pathname === "/ananya";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isProfessionalsPage ? <Page2 /> : isDemoPdpPage ? <Page3 /> : <App />}
  </React.StrictMode>
);
