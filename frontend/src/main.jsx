import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(10, 16, 34, 0.92)",
            color: "#e2e8f0",
            border: "1px solid rgba(148, 163, 184, 0.16)",
          },
        }}
      />
    </HashRouter>
  </React.StrictMode>,
);
