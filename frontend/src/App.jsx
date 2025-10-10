// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// Shell + screens
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
import InternationalBeneficiaries from "./components/InternationalBeneficiaries";
import AddBeneficiaryIntlPayments from "./components/AddBeneficiaryIntlPayments";
import IntlSwiftConfirmation from "./components/IntlSwiftConfirmation";
// Local transfer flow
import LocalTransferBeneficiaries from "./components/LocalTransferBeneficiaries";
import LocalTransferForm from "./components/LocalTransferForm";
import LocalTransferDetails from "./components/LocalTransferDetails";
import LocalTransferPay from "./components/LocalTransferPay";
import LocalTransferPassword from "./components/LocalTransferPassword";


// Recurring flow
import AddBeneficiaryOptions from "./components/AddBeneficiaryOptions";
import RecurringAddBeneficiary from "./components/RecurringAddBeneficiary";
import RecurringAddPayment from "./components/RecurringAddPayment";

// Context providers (mount ONLY inside /app)
import { AccountProvider } from "./context/AccountContext";
import { BeneficiaryProvider } from "./context/BeneficiaryContext";
import { LocalTransferProvider } from "./context/LocalTransferContext";
import { InternationalProvider } from "./context/InternationalContext";

import "./App.css";

// Simple auth gate – keeps public routes public and protects /app
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* AUTHENTICATED APP */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            {/* Providers are mounted only after auth to avoid 401s on public pages */}
            <AccountProvider>
              <BeneficiaryProvider>
                <LocalTransferProvider>
                  <InternationalProvider>
                    <DashboardLayout />
                  </InternationalProvider>
                </LocalTransferProvider>
              </BeneficiaryProvider>
            </AccountProvider>
          </RequireAuth>
        }
      >
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

         {/* Local Transfer routes */}
<Route path="local-transfer/beneficiaries" element={<LocalTransferBeneficiaries />} />
<Route path="local-transfer/add" element={<LocalTransferForm />} />
<Route path="local-transfer/details/:id" element={<LocalTransferDetails />} />
<Route path="local-transfer/pay" element={<LocalTransferPay />} />
<Route path="local-transfer/password" element={<LocalTransferPassword />} />


         {/* International flow */}
        <Route path="international" element={<InternationalBeneficiaries />} />
        <Route path="international/add" element={<AddBeneficiaryIntlPayments />} />
        <Route path="international/confirm" element={<IntlSwiftConfirmation />} />

        {/* Recurring Payments flow */}
        <Route path="recurring/options" element={<AddBeneficiaryOptions />} />
        <Route path="recurring/add-beneficiary" element={<RecurringAddBeneficiary />} />
        <Route path="recurring/add-payment" element={<RecurringAddPayment />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
