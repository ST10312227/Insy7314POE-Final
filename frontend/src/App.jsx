import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import BuyElectricityWater from './components/BuyElectricityWater';
import AddBeneficiaryForm from './components/AddBeneficiaryForm';
// Import other page components as needed

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<AddBeneficiaryForm />} />
        <Route path="AddBeneficiaryForm" element={<AddBeneficiaryForm />} />
        {/* <Route path="bill-payments" element={<BillPayments />} /> */}
      </Route>
      {/* Add other top-level routes if needed */}
    </Routes>
  );
}

export default App;
