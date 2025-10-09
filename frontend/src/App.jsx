import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import BuyElectricityWater from './components/BuyElectricityWater';
import AddBeneficiaryForm from './components/AddBeneficiaryForm';
import InternationalPayments from './components/InternationalPayments';
import InternationalBeneficiaries from './components/InternationalBeneficiaries';
import AddBeneficiaryIntlPayments from './components/AddBeneficiaryIntlPayments';
import IntlSwiftConfirmation from './components/IntlSwiftConfirmation';
// Import other page components as needed
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

// ✅ Local Transfer flow
import LocalTransferBeneficiaries from "./components/LocalTransferBeneficiaries";
import LocalTransferForm from "./components/LocalTransferForm";
import LocalTransferPay from "./components/LocalTransferPay";
import LocalTransferPassword from "./components/LocalTransferPassword";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<IntlSwiftConfirmation />} />
        <Route path="IntlSwiftConfirmation" element={<IntlSwiftConfirmation />} />
        
      {/* PUBLIC PAGES */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* APP (dashboard shell) */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bill-payments" element={<BillPayments />} />
        <Route path="account-details" element={<AccountDetails />} />
        <Route path="search" element={<Search />} />
        <Route path="funds-transfer" element={<FundsTransfer />} />
        <Route path="transaction-history" element={<TransactionHistory />} />

        {/* Airtime flow */}
        <Route path="buy-airtime" element={<BuyAirtime />} />
        <Route path="add-beneficiary" element={<AddBeneficiary />} />
        <Route path="beneficiary-details/:id" element={<BeneficiaryDetails />} />

        {/* ✅ Local Transfers flow */}
        <Route path="local-transfer" element={<LocalTransferBeneficiaries />} />
        <Route path="local-transfer/new" element={<LocalTransferForm />} />
        <Route path="local-transfer/pay" element={<LocalTransferPay />} />
        <Route path="local-transfer/password" element={<LocalTransferPassword />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
