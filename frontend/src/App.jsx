// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import BillPayments from "./components/BillPayments";
import AccountDetails from "./components/AccountDetails";
import Search from "./components/Search";
import FundsTransfer from "./components/FundsTransfer";
import TransactionHistory from "./components/TransactionHistory";
import BuyAirtime from "./components/BuyAirtime";
import AddBeneficiary from "./components/AddBeneficiary";
import BeneficiaryDetails from "./components/BeneficiaryDetails";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Home from "./components/Home";
import About from "./components/About";

// ✅ International payments
import InternationalBeneficiaries from "./components/InternationalBeneficiaries";
import AddBeneficiaryIntlPayments from "./components/AddBeneficiaryIntlPayments";
import IntlSwiftConfirmation from "./components/IntlSwiftConfirmation";

import "./App.css";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* APP */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bill-payments" element={<BillPayments />} />
        <Route path="account-details" element={<AccountDetails />} />
        <Route path="search" element={<Search />} />
        <Route path="funds-transfer" element={<FundsTransfer />} />
        <Route path="transaction-history" element={<TransactionHistory />} />

        {/* Airtime */}
        <Route path="buy-airtime" element={<BuyAirtime />} />
        <Route path="add-beneficiary" element={<AddBeneficiary />} />
        <Route path="beneficiary-details/:id" element={<BeneficiaryDetails />} />

        {/* ✅ International */}
        <Route path="international" element={<InternationalBeneficiaries />} />
        <Route path="international/add" element={<AddBeneficiaryIntlPayments />} />
        <Route path="international/confirm" element={<IntlSwiftConfirmation />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
