// App.jsx
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

// ✅ Make sure this path matches where your file lives
import Signup from "./components/Signup";
import Login from "./components/Login"; // optional (stub below)

import "./App.css";

function App() {
  return (
    <Routes>
      {/* Default: go to signup */}
      <Route path="/" element={<Navigate to="/signup" replace />} />

      {/* Auth pages (no dashboard layout) */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Main app under /app with the dashboard shell */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bill-payments" element={<BillPayments />} />
        <Route path="account-details" element={<AccountDetails />} />
        <Route path="search" element={<Search />} />
        <Route path="funds-transfer" element={<FundsTransfer />} />
        <Route path="transaction-history" element={<TransactionHistory />} />
        <Route path="buy-airtime" element={<BuyAirtime />} />
        <Route path="add-beneficiary" element={<AddBeneficiary />} />
        <Route path="beneficiary-details/:id" element={<BeneficiaryDetails />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}

export default App;
