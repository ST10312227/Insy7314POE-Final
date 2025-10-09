import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaLock, FaCheckCircle } from "react-icons/fa";
import "./LocalTransferPassword.css";

function LocalTransferPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [transaction, setTransaction] = useState(null);

  const formData = state || {};

  // === Handle password submission ===
  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === "1234") {
      const transactionRef = "TX-" + Math.floor(100000 + Math.random() * 900000);
      const timestamp = new Date().toLocaleString("en-ZA", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      setTransaction({
        reference: transactionRef,
        date: timestamp,
      });

      setConfirmed(true);

      // Redirect back to fund transfer after 4 seconds
      setTimeout(() => {
        navigate("/funds-transfer");
      }, 6000);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  // === Confirmation Page ===
  if (confirmed) {
    return (
      <div className="confirmation-page fade-in">
        <div className="confirmation-card">
          <div className="icon-circle success">
            <FaCheckCircle size={32} />
          </div>
          <h2 className="card-title">Payment Successful!</h2>
          <p className="beneficiary-subtext">
            Your transfer to <strong>{formData.name}</strong> has been processed successfully.
          </p>

          <hr className="divider" />

          <div className="beneficiary-info">
            <p><strong>Transaction Ref:</strong> {transaction?.reference}</p>
            <p><strong>Date:</strong> {transaction?.date}</p>
            <p><strong>Bank:</strong> {formData.bank}</p>
            <p><strong>Branch Code:</strong> {formData.branchCode}</p>
            <p><strong>Account Number:</strong> {formData.accountNumber}</p>
            <p><strong>Account Type:</strong> {formData.accountType}</p>
            <p><strong>Amount:</strong> R{formData.amount}</p>
            <p><strong>Own Reference:</strong> {formData.ownReference}</p>
            <p><strong>Recipient Reference:</strong> {formData.recipientReference}</p>
            <p><strong>Payment Type:</strong> {formData.paymentType || "Real-time"}</p>
          </div>

          <hr className="divider" />

          <p className="redirect-text">
            Redirecting to Fund Transfer in <strong>4s</strong>...
          </p>
        </div>
      </div>
    );
  }

  // === Password Input Page ===
  return (
    <div className="local-transfer-password-page fade-in">
      <button className="back-icon" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="local-transfer-password-card">
        <div className="icon-circle">
          <FaLock />
        </div>

        <h2 className="card-title">Enter Password</h2>
        <hr className="divider" />

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="submit-btn">
            Confirm Payment
          </button>
        </form>
      </div>
    </div>
  );
}

export default LocalTransferPassword;
