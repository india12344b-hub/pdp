import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Page2 from "./Page2";
import "./styles.css";
import "./page2.css";

const isProfessionalsPage = window.location.pathname.replace(/\/$/, "") === "/professionals";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isProfessionalsPage ? <Page2 /> : <App />}
  </React.StrictMode>
);
