import React from "react";
import "./InternationalPayments.css";

function InternationalPayments() {
  return (
    <div className="intl-section-bg">
      <div className="intl-card">
        <div className="intl-badge">
          <img
            src="/international.svg" // put your international icon here (transparent PNG/SVG) for perfection!
            alt="International"
            style={{width:'38px',height:'38px'}}
          />
        </div>
        <div className="intl-title">International Payments</div>
        <div className="intl-actions">
          <button className="intl-btn">
            <div className="intl-btn-main">Make a payment</div>
            <div className="intl-btn-desc">
              Pay someone in another country
            </div>
          </button>
          <button className="intl-btn">
            <div className="intl-btn-main">Receive a payment</div>
            <div className="intl-btn-desc">
              Approve an incoming payment
            </div>
          </button>
        </div>
        <div className="intl-form">
          <div className="intl-form-label">My international details</div>
          <div className="intl-details">
            <label>Account Number</label>
            <p>155869746</p>
          </div>
          <div className="intl-details">
            <label>SWIFT number</label>
            <p>CAIBZAJJ</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternationalPayments;
