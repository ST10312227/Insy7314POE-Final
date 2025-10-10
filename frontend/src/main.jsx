// src/main.jsx (or index.jsx — whatever bootstraps <App />)
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { BeneficiaryProvider } from "./context/BeneficiaryContext";
import { InternationalProvider } from "./context/InternationalContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <InternationalProvider>
        <BeneficiaryProvider>
          <App />
        </BeneficiaryProvider>
      </InternationalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
