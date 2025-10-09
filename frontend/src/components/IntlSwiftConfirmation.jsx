import React from "react";
import "./IntlSwiftConfirmation.css"; // See CSS below
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

function IntlSwiftConfirmation({ data }) {
  // Replace data with props/context as needed; below is sample data
  const navigate = useNavigate();

  // Sample data, supply these as props for real use
  const confirmation = data || {
    name: "Chen Wei",
    country: "China",
    address: "88 Nanjing Road",
    city: "Shanghai",
    bankName: "Bank of China",
    account: "CN123456789012",
    swift: "BKCHCNBJ",
    amount: "10,000.00",
    currency: "CNY",
    date: "12-09-2025",
    status: "Pending (Awaiting Bank Verification)"
  };

  return (
    <div className="confirm-page-bg">
      <button className="back-icon" onClick={() => navigate("/fund-transfer")}>
        <FaArrowLeft />
      </button>
      <div className="confirm-card">
        <div className="confirm-check">
          <FaCheckCircle size={68} color="#2ecc40" style={{ background: "#fff", borderRadius: "50%" }} />
        </div>
        <div className="confirm-title">
          International SWIFT Payment Confirmation
        </div>
        <div className="confirm-sub">
          Your payment has been submitted for processing.
        </div>
        <div className="confirm-status">
          STATUS: <span>PENDING</span>
        </div>
        <div className="confirm-detail-table">
          <div><span>Beneficiary Name</span><span>{confirmation.name}</span></div>
          <div><span>Country</span><span>{confirmation.country}</span></div>
          <div><span>Address</span><span>{confirmation.address}</span></div>
          <div><span>City/ Town</span><span>{confirmation.city}</span></div>
          <div><span>Payee Bank Name</span><span>{confirmation.bankName}</span></div>
          <div><span>Payee Account Number</span><span>{confirmation.account}</span></div>
          <div><span>SWIFT Code</span><span>{confirmation.swift}</span></div>
          <div><span>Amount</span><span>{confirmation.amount}</span></div>
          <div><span>Currency</span><span>{confirmation.currency}</span></div>
          <div><span>Date</span><span>{confirmation.date}</span></div>
          <div>
            <span>Transaction Status</span>
            <span>{confirmation.status}</span>
          </div>
        </div>
        <button className="confirm-btn" onClick={() => navigate("/fund-transfer")}>
          Back to Fund Transfer
        </button>
      </div>
    </div>
  );
}

export default IntlSwiftConfirmation;
