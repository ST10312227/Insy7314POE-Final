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

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" />} />
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
    </Routes>
  );
}

export default App;
