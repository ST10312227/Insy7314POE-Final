import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserFriends } from "react-icons/fa";
import "./LocalTransferPay.css";

export default function LocalTransferPay() {
  const navigate = useNavigate();
  const { state } = useLocation(); // beneficiary details from step 1 or from list
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);

  useEffect(() => {
    if (!state) navigate("/app/local-transfer/new", { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  const [formData, setFormData] = useState({
    amount: "",
    ownReference: "",
    recipientReference: "",
    paymentType: "Real-time",
  });

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...state, ...formData, saveBeneficiary };
    navigate("/app/local-transfer/password", { state: payload });
  };

  return (
    <div className="local-transfer-page fade-in">
      <button className="back-icon" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="local-transfer-card">
        <div className="icon-circle"><FaUserFriends /></div>
        <h2 className="card-title">Pay</h2>
        <hr className="divider" />

        <div className="account-box">
          <div>
            <strong>Main Account</strong><br />
            <small>Available Balance</small>
          </div>
          <div className="account-balance">R15 000.00</div>
        </div>

        <div className="beneficiary-box">
          <p><strong>{state.bank}</strong></p>
          <p>
            {state.accountNumber}<br />
            <small>Branch Code - {state.branchCode}</small>
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

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
            <input
              type="checkbox"
              checked={saveBeneficiary}
              onChange={(e) => setSaveBeneficiary(e.target.checked)}
            />
            Save this beneficiary for later
          </label>

          <button type="submit" className="submit-btn">Pay Now</button>
        </form>
      </div>
    </div>
  );
}
