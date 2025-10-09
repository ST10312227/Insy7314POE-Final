import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { BeneficiaryProvider } from "./context/BeneficiaryContext";
import { LocalTransferProvider } from "./context/LocalTransferContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <BeneficiaryProvider>
        <LocalTransferProvider>
          <App />
        </LocalTransferProvider>
      </BeneficiaryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
