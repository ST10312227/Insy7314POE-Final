// App.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Shell + screens
import Navbar from "./components/Navbar";
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
// import Signup from "./components/Signup"; // ⟵ removed
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

// NEW: Employee pages
import EmployeeLogin from "./components/EmployeeLogin";
import EmployeeDashboard from "./components/EmployeeDashboard";
import CreateUser from "./components/CreateUser";
import EmployeeApprovals from "./components/EmployeeApprovals";
import EmployeeSwiftVerification from "./components/EmployeeSwiftVerification"; // ⟵ NEW
import EmployeeDashboardLayout from "./components/EmployeeDashboardLayout";

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

// -------- Guards --------
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireEmployee({ children }) {
  const empToken = localStorage.getItem("employee_token");
  if (!empToken) return <Navigate to="/employee-login" replace />;
  return children;
}

// Public shell to show Navbar on public pages
function PublicShell() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC (Navbar visible via PublicShell) */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

    </Route>

    {/* EMPLOYEE LOGIN/ROUTES — NO PUBLIC NAVBAR */}
    {/* Employee auth + pages */}

    <Route element={<PublicShell />}>
      <Route path="/employee-login" element={<EmployeeLogin />} />
    </Route>
    
    <Route
      path="/employee"
      element={
        <RequireEmployee>
          <AccountProvider> 
            <EmployeeDashboardLayout /> {/* Sidebar + Topbar layout */}
          </AccountProvider>
        </RequireEmployee>
      }
    >
          {/* Default route → goes straight to pending transactions */}
          <Route index element={<Navigate to="pending-transactions" replace />} />

          
          {/* Dashboard */}
          <Route path="dashboard" element={<EmployeeDashboard />} />

          {/* Pending transactions */}
          <Route path="pending-transactions" element={<EmployeeApprovals />} />

          {/* Create user page */}
          <Route path="create-user" element={<CreateUser />} />

          {/* Approval details / verification page */}
          <Route path="approvals/:id" element={<EmployeeSwiftVerification />} />
        </Route>

        {/* Back-compat redirect if anything still links to /signup */}
        <Route path="/signup" element={<Navigate to="/employee-login" replace />} />

      {/* AUTHENTICATED CUSTOMER APP (no public Navbar here) */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            {/* Providers mounted only after auth to avoid 401s on public pages */}
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
        <Route path="local-transfer/new" element={<LocalTransferForm />} />
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
