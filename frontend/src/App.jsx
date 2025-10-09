import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import BuyElectricityWater from './components/BuyElectricityWater';
import AddBeneficiaryForm from './components/AddBeneficiaryForm';
import InternationalPayments from './components/InternationalPayments';
import InternationalBeneficiaries from './components/InternationalBeneficiaries';
import AddBeneficiaryIntlPayments from './components/AddBeneficiaryIntlPayments';
import IntlSwiftConfirmation from './components/IntlSwiftConfirmation';
// Import other page components as needed

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<IntlSwiftConfirmation />} />
        <Route path="IntlSwiftConfirmation" element={<IntlSwiftConfirmation />} />
        
      </Route>
      {/* Add other top-level routes if needed */}
    </Routes>
  );
}

export default App;
