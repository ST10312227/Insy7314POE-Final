import React, { useState } from "react";
import "./InternationalBeneficiaries.css";

export default function InternationalBeneficiaries() {
  const [activeTab, setActiveTab] = useState("Pay");

  // Fake transaction data for demonstration
  const transactionHistory = [
    {
      id: 1,
      name: "Janie Doe",
      iconColor: "#e15d64", // red/cross
      amount: "-R1 000.00",
      amountColor: "#e15d64",
      date: "09.04.2025",
      type: "debit",
    },
    {
      id: 2,
      name: "Joe Doe",
      iconColor: "#2dbe7f", // green/tick
      amount: "+R1 500.00",
      amountColor: "#233678",
      date: "09.04.2025",
      type: "credit",
    },
  ];

  return (
    <div className="intl-section-bg">
      <div className="intl-card">
        <div className="intl-badge">
          <img
            src="/international.svg"
            alt="International"
            style={{width:'38px',height:'38px'}}
          />
        </div>
        <div className="intl-title">International Payments</div>
        <div className="intl-tabs">
          <button
            className={`intl-tab-btn${activeTab === "Pay" ? " active" : ""}`}
            onClick={() => setActiveTab("Pay")}
          >
            Pay
          </button>
          <button
            className={`intl-tab-btn${activeTab === "History" ? " active" : ""}`}
            onClick={() => setActiveTab("History")}
          >
            History
          </button>
        </div>
        <div className="intl-beneficiaries-content">
          {activeTab === "Pay" ? (
            <div className="intl-no-beneficiaries">
              You have no beneficiaries.
            </div>
          ) : (
            <div className="intl-history-list">
              {transactionHistory.map((tx, idx) => (
                <div
                  key={tx.id}
                  className={`intl-history-item ${tx.type === "credit" ? "credit" : "debit"}`}
                >
                  <div
                    className="intl-history-icon"
                    style={{ borderColor: tx.iconColor }}
                  >
                    {tx.type === "debit" ? (
                      <svg width="15" height="15" viewBox="0 0 15 15">
                        <circle cx="7.5" cy="7.5" r="7" stroke={tx.iconColor} strokeWidth="1.5" fill="none"/>
                        <path d="M5.2 5.2 l4.6 4.6 M9.8 5.2 l-4.6 4.6" stroke={tx.iconColor} strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 15 15">
                        <circle cx="7.5" cy="7.5" r="7" stroke={tx.iconColor} strokeWidth="1.5" fill="none"/>
                        <polyline points="4.5,8 7,10.5 10.5,5.5" fill="none" stroke={tx.iconColor} strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="intl-history-text">
                    <span className="intl-history-name">{tx.name}</span>
                  </div>

                  <div className="intl-history-text">
                    <span
                      className="intl-history-amount"
                      style={{ color: tx.amountColor }}
                    >
                      {tx.amount}
                    </span>
                  <div className="intl-history-date">{tx.date}</div>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
          <button className="intl-add-beneficiary-btn">
            Add Beneficiaries
          </button>
        </div>
      </div>
    </div>
  );
}

