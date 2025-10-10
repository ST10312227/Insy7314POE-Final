import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import BillPayments from "./components/BillPayments";
import AccountDetails from "./components/AccountDetails";

import "./App.css";
import RecurringAddBeneficiary from "./components/RecurringAddBeneficiary";
import AddBeneficiaryOptions from "./components/AddBeneficiaryOptions";
import RecurringAddPayment from "./components/RecurringAddPayment";


function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bill-payments" element={<BillPayments />} />
        <Route path="account-details" element={<AccountDetails />} />
         <Route path="RecurringAddBeneficiary" element={<RecurringAddBeneficiary />} />
        <Route path="AddBeneficiaryOptions" element={<AddBeneficiaryOptions />} />
        <Route path="RecurringAddPayment" element={<RecurringAddPayment />} />
       
      </Route>
    </Routes>
  );
}

export default App;

