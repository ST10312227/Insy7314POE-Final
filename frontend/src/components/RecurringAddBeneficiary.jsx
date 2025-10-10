// components/RecurringAddBeneficiary.jsx
import "./RecurringAddBeneficiary.css";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPhone } from "react-icons/fa";
import { useState } from "react";

function RecurringAddBeneficiary() {
  const navigate = useNavigate();
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

    // send to /app/recurring/add-payment with the beneficiary details
    navigate("/app/recurring/add-payment", {
      state: {
        name: form.beneficiaryName,
        bank: form.bank,
        accountNumber: form.accountNumber,
        branchCode: form.branchCode,
        reference: form.reference,
        notificationType: form.notificationType,
      },
    });
  };

  return (
    <div className="add-beneficiary-page">
      <button className="back-icon" onClick={() => navigate("/app/recurring/options")}>
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
            value={form.beneficiaryName}
            onChange={handleChange}
            required
          />

          <label>Account Number</label>
          <input
            type="text"
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            required
          />

          <label>Select Bank</label>
          <select
            name="bank"
            value={form.bank}
            onChange={handleChange}
            required
          >
            <option value="">Choose Bank</option>
            <option value="Vault">Vault</option>
            <option value="Nedbank">Nedbank</option>
            <option value="FNB">FNB</option>
            <option value="ABSA">ABSA</option>
            <option value="Capitec">Capitec</option>
            <option value="Standard Bank">Standard Bank</option>
          </select>

          <label>Branch Code</label>
          <input
            type="text"
            name="branchCode"
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

          <button type="submit" className="add-btn">Continue</button>
        </form>
      </div>
    </div>
  );
}

export default RecurringAddBeneficiary;
