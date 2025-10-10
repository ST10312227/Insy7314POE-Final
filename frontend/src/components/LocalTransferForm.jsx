import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserFriends } from "react-icons/fa";
import "./LocalTransferForm.css";

function LocalTransferForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bank: "",
    branchCode: "",
    accountType: "",
    name: "",
    accountNumber: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Basic validation
    if (
      !formData.bank ||
      !formData.branchCode ||
      !formData.accountType ||
      !formData.name ||
      !formData.accountNumber
    ) {
      alert("Please complete all fields before proceeding.");
      return;
    }

    // ✅ Navigate to password page (temporary: confirmation page)
    navigate("/local-transfer/pay", { state: formData });
  };

  return (
    <div className="local-transfer-form-page fade-in">
      <button className="back-icon" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="local-transfer-form-card">
        <div className="icon-circle">
          <FaUserFriends />
        </div>

        <h2 className="card-title">Payment Details</h2>
        <hr className="divider" />

        <form className="transfer-form" onSubmit={handleSubmit}>
          <label htmlFor="bank">Select Bank</label>
          <select
            id="bank"
            name="bank"
            value={formData.bank}
            onChange={handleChange}
          >
            <option value="">Select bank</option>
            <option value="Absa">Absa</option>
            <option value="Nedbank">Nedbank</option>
            <option value="Capitec">Capitec</option>
            <option value="FNB">FNB</option>
            <option value="Standard Bank">Standard Bank</option>
          </select>

          <label htmlFor="branchCode">Branch Code</label>
          <input
            id="branchCode"
            name="branchCode"
            type="text"
            placeholder="Enter branch code"
            value={formData.branchCode}
            onChange={handleChange}
          />

          <label htmlFor="accountType">Account Type</label>
          <select
            id="accountType"
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
          >
            <option value="">Select account type</option>
            <option value="Savings">Savings</option>
            <option value="Cheque">Cheque</option>
            <option value="Credit">Credit</option>
          </select>

          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter name"
            value={formData.name}
            onChange={handleChange}
          />

          <label htmlFor="accountNumber">Account Number</label>
          <input
            id="accountNumber"
            name="accountNumber"
            type="text"
            placeholder="Enter account number"
            value={formData.accountNumber}
            onChange={handleChange}
          />

          <button type="submit" className="submit-btn">
            Next
          </button>
        </form>
      </div>
    </div>
  );
}

export default LocalTransferForm;
 