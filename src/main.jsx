import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App-5.jsx";

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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            direction: "rtl",
            fontFamily: "sans-serif",
            padding: 20,
            color: "#B5482F",
            whiteSpace: "pre-wrap",
            fontSize: 14,
          }}
        >
          حدث خطأ بالتطبيق{"\n\n"}
          {String(this.state.error && this.state.error.message)}
          {"\n\n"}
          {String(this.state.error && this.state.error.stack)}
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
