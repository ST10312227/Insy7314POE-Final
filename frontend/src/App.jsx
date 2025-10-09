import React from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AddBeneficiaryForm from "./components/AddBeneficiaryForm";
import PurchaseAirtimeDetails from "./components/PurchaseAirtimeDetails";
import BuyElectricityWater from "./components/BuyElectricityWater";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import "./components/AddBeneficiary.css";
import "./components/PurchaseAirtimeDetails.css";
import "./components/BuyElectricityWater.css";
import "./components/DashboardLayout.css";
import "./components/Sidebar.css"
import "./components/Topbar.css";
import "./App.css";

function App() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}

export default App;

