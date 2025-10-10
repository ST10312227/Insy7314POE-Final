import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaUserFriends } from "react-icons/fa";
import "./RecurringAddPayment.css";

function RecurringAddPayment() {
  const navigate = useNavigate();
  const { state } = useLocation(); // ✅ get beneficiary info from previous page

  const beneficiary = state || {};

  const [formData, setFormData] = useState({
    amount: "",
    futureDated: false,
    recurringPayment: false,
    recurringFrequency: "",
    startDate: "",
    endDate: "",
    beneficiaryReference: "",
    statementDescription: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" || type === "radio" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const completeData = { ...beneficiary, ...formData };
    navigate("/local-transfer/password", { state: completeData });
  };

  return (
    <div className="local-transfer-page fade-in">
      <button className="back-icon" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="local-transfer-card">
        <div className="icon-circle">
          <FaUserFriends />
        </div>

        <h2 className="card-title">Add Payment</h2>

       
       
        <p
          style={{
            marginTop: "-10px",
            color: "#12255c",
            fontWeight: 500,
            lineHeight: "1.6",
          }}
        >
          <strong>John Doe</strong>  <br />
          <strong>Standard Bank</strong> <br />
          <strong>123456789</strong> 
        </p>

        <hr className="divider" />

        
        <h4
          style={{
            textAlign: "left",
            color: "#12255c",
            marginBottom: "6px",
            fontSize: "15px",
            fontWeight: 600,
          }}
        >
          From
        </h4>

        
        <div className="account-box">
          <div>
            <strong>Main Account</strong>
            <br />
            <small>Available Balance</small>
          </div>
          <div className="account-balance">R15 000.00</div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="payment-form">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <div className="payment-type">
            <label>
              <input
                type="radio"
                name="futureDated"
                checked={formData.futureDated}
                onChange={handleChange}
              />
              Future Dated Payment
            </label>

            <label>
              <input
                type="radio"
                name="recurringPayment"
                checked={formData.recurringPayment}
                onChange={handleChange}
              />
              Recurring Payment
            </label>
          </div>

          {/* ✅ Recurring Payment Section */}
          {formData.recurringPayment && (
            <div className="recurring-section">
              <label>Choose Frequency</label>
              <select
                name="recurringFrequency"
                value={formData.recurringFrequency}
                onChange={handleChange}
                required
              >
                <option value="">Select Frequency</option>
                <option value="Weekly">Weekly</option>
                 <option value="Fortnightly">Fortnightly</option>
                <option value="Monthly">Monthly</option>
                 <option value="MonthlyEnd">Monthly: Month End</option>
                  <option value="Quaterly">Quarterly</option>
                   <option value="QuarterlyEnd">Quarterly: Month End</option>
              </select>

              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <label>Beneficiary Reference</label>
          <input
            type="text"
            name="beneficiaryReference"
            placeholder="Enter beneficiary reference"
            value={formData.beneficiaryReference}
            onChange={handleChange}
            required
          />

          <label>Statement Description</label>
          <input
            type="text"
            name="statementDescription"
            placeholder="Enter statement description"
            value={formData.statementDescription}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-btn">
            Add 
          </button>
        </form>
      </div>
    </div>
  );
}

export default RecurringAddPayment;
