// src/components/IntlSwiftConfirmation.jsx
import React from "react";
import "./IntlSwiftConfirmation.css";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

export default function IntlSwiftConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const confirmation = state?.data;

  // If someone refreshes this page or arrives directly, send them back
  if (!confirmation) {
    navigate("/app/international", { replace: true });
    return null;
  }

  return (
    <div className="confirm-page-bg">
      <button className="back-icon" onClick={() => navigate("/app/funds-transfer")}>
        <FaArrowLeft />
      </button>

      <div className="confirm-card">
        <div className="confirm-check">
          <FaCheckCircle size={68} color="#2ecc40" style={{ background: "#fff", borderRadius: "50%" }} />
        </div>

        <div className="confirm-title">International SWIFT Payment Confirmation</div>
        <div className="confirm-sub">Your payment has been submitted for processing.</div>
        <div className="confirm-status">STATUS: <span>PENDING</span></div>

        <div className="confirm-detail-table">
          <div><span>Beneficiary Name</span><span>{confirmation.firstName} {confirmation.lastName}</span></div>
          <div><span>Country</span><span>{confirmation.country}</span></div>
          <div><span>Address</span><span>{confirmation.address}</span></div>
          <div><span>City/ Town</span><span>{confirmation.cityName}</span></div>
          <div><span>Payee Bank Name</span><span>{confirmation.bank}</span></div>
          <div><span>Payee Account Number</span><span>{confirmation.accountNumber}</span></div>
          <div><span>SWIFT Code</span><span>{confirmation.swiftCode}</span></div>
          <div><span>Amount</span><span>{confirmation.amount}</span></div>
          <div><span>Currency</span><span>{confirmation.currency}</span></div>
          <div><span>Reference</span><span>{confirmation.reference || "—"}</span></div>
        </div>

        <button className="confirm-btn" onClick={() => navigate("/app/funds-transfer")}>
          Back to Fund Transfer
        </button>
      </div>
    </div>
  );
}
