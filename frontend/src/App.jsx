import React from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AddBeneficiaryForm from "./components/AddBeneficiaryForm";
import PurchaseAirtimeDetails from "./components/PurchaseAirtimeDetails";
import BuyElectricityWater from "./components/BuyElectricityWater";
import "./components/AddBeneficiary.css";
import "./components/PurchaseAirtimeDetails.css";
import "./components/BuyElectricityWater.css";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-section">
        <Topbar />
        <BuyElectricityWater />
      </div>
    </div>
  );
}

export default App;

