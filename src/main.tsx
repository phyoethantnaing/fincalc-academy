import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles.css";
registerSW({ immediate: true });
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense
      fallback={
        <div className="app-loading">
          FinCalc Academy · Loading learning lab…
        </div>
      }
    >
      <App />
    </React.Suspense>
  </React.StrictMode>,
);
