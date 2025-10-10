import "./RecurringAddBeneficiary.css";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPhone } from "react-icons/fa";
import { useState } from "react";
import { useBeneficiaries } from "../context/BeneficiaryContext"; // ✅ import context

function RecurringAddBeneficiary() {
  const navigate = useNavigate();
  const { addBeneficiary } = useBeneficiaries(); // ✅ use context
  const [form, setForm] = useState({
    beneficiaryName: "",
    accountNumber: "",
    bank: "",
    branchCode: "",
    reference: "",
    notificationType: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    addBeneficiary(form); // ✅ add to shared list
    navigate("/beneficiary-confirmation"); // ✅ go back to list
  };

  return (
    <div className="add-beneficiary-page">
      <button className="back-icon" onClick={() => navigate("/add-beneficiary-options")}>
        <FaArrowLeft />
      </button>

      <div className="add-beneficiary-card">
        <div className="icon-circle">
          <FaPhone />
        </div>

        <h2 className="card-title">Add Beneficiary</h2>

        <form onSubmit={handleSubmit} className="beneficiary-form">
          <label>Beneficiary Name</label>
          <input
            type="text"
            name="beneficiaryName"
            placeholder=""
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Account Number</label>
          <input
            type="text"
            name="accountNumber"
            placeholder=""
            value={form.accountNumber}
            onChange={handleChange}
            required
          />

          <label>Select Bank</label>
          <select
            name="bank"
            value={form.network}
            onChange={handleChange}
            required
          >
            <option value="">Choose Bank</option>
            <option value="Vault">Cell C</option>
            <option value="Nedbank">MTN</option>
            <option value="FNB">Telkom Mobile</option>
            <option value="ABSA">Vodacom</option>
             <option value="Capitec">Vodacom</option>
          </select>

            <label>Branch Code</label>
          <input
            type="text"
            name="branchCode"
            placeholder=""
            value={form.branchCode}
            onChange={handleChange}
            required
          />

           <label>Beneficiary Reference</label>
          <input
            type="text"
            name="reference"
            value={form.reference}
            onChange={handleChange}
            required
          />
           <label>Payment Notification</label>
          <select
            name="notificationType"
            value={form.notificationType}
            onChange={handleChange}
            required
          >
            <option value="">Choose Notification Type</option>
            <option value="SMS">SMS</option>
            <option value="Email">Email</option>
            <option value="None">None</option>
          </select>


          <button type="submit" className="add-btn">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

export default RecurringAddBeneficiary;
