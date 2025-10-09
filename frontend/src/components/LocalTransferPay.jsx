import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaUserFriends } from "react-icons/fa";
import "./LocalTransferPay.css";

function LocalTransferPay() {
  const navigate = useNavigate();
  const { state } = useLocation(); // ✅ get beneficiary info from previous page

  const beneficiary = state || {};

  const [formData, setFormData] = useState({
    amount: "",
    ownReference: "",
    recipientReference: "",
    paymentType: "Real-time",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Merge all data (beneficiary + form)
    const completeData = { ...beneficiary, ...formData };

    // ✅ Navigate to password screen with all data
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

        <h2 className="card-title">Pay</h2>
        <hr className="divider" />

        <div className="account-box">
          <div>
            <strong>Main Account</strong>
            <br />
            <small>Available Balance</small>
          </div>
          <div className="account-balance">R15 000.00</div>
        </div>

        <div className="beneficiary-box">
          <p>
            <strong>{beneficiary.bank}</strong>
          </p>
          <p>
            {beneficiary.accountNumber}
            <br />
            <small>Branch Code - {beneficiary.branchCode}</small>
          </p>
        </div>

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

          <label>Own Reference</label>
          <input
            type="text"
            name="ownReference"
            placeholder="Enter reference"
            value={formData.ownReference}
            onChange={handleChange}
            required
          />

          <label>Recipient Reference</label>
          <input
            type="text"
            name="recipientReference"
            placeholder="Enter reference"
            value={formData.recipientReference}
            onChange={handleChange}
            required
          />

          <div className="payment-type">
            <label>
              <input
                type="radio"
                name="paymentType"
                value="Real-time"
                checked={formData.paymentType === "Real-time"}
                onChange={handleChange}
              />
              Real-time payment
            </label>

            <label>
              <input
                type="radio"
                name="paymentType"
                value="Proof of Payment"
                checked={formData.paymentType === "Proof of Payment"}
                onChange={handleChange}
              />
              Send proof of payment
            </label>
          </div>

          <button type="submit" className="submit-btn">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}

export default LocalTransferPay;
