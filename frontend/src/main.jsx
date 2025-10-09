import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { BeneficiaryProvider } from "./context/BeneficiaryContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <BeneficiaryProvider>   {/* ✅ Wrap here */}
        <App />
      </BeneficiaryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
