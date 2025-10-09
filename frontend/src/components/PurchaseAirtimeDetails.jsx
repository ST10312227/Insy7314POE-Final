import React from "react";
import "./PurchaseAirtimeDetails.css";

function PurchaseAirtimeDetails() {
  return (
    <div className="airtime-details-container">
      <div className="icon-circle">📞</div>

      <div className="airtime-details-card">
        <div className="user-info">
          <h2>John Doe</h2>
          <p className="network">Vodacom</p>
          <p className="phone-number">082 654 5879</p>
        </div>

        <div className="form-section">
          <label className="form-label">From</label>
          <div className="account-box">
            <div>
              <p className="account-name">Main Account</p>
              <span className="account-subtext">Available Balance</span>
            </div>
            <p className="account-balance">R15 000.00</p>
          </div>

          <label className="form-label">Choose Product Type</label>
          <select className="dropdown">
            <option value="">Select Product</option>
            <option value="airtime">Airtime</option>
            <option value="data">Data</option>
          </select>

          <button className="buy-btn">Buy</button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseAirtimeDetails;
