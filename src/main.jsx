import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App-9.jsx";

function showError(msg) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML =
      '<div style="direction:rtl;font-family:sans-serif;padding:20px;color:#B5482F;white-space:pre-wrap;font-size:14px">' +
      msg +
      "</div>";
  }
}

window.addEventListener("error", (e) => {
  showError(e.message + "\n" + (e.error && e.error.stack ? e.error.stack : ""));
});
window.addEventListener("unhandledrejection", (e) => {
  showError(
    "Promise error: " +
      (e.reason && e.reason.message ? e.reason.message : String(e.reason))
  );
});

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
