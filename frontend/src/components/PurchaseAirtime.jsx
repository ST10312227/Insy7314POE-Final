import React, { useState } from "react";
import "./PurchaseAirtime.css";

function PurchaseAirtime() {
  const [beneficiaries] = useState([
    "John Doe",
    "Jane Doe",
    "Jason Doe",
    "Jenna Doe",
  ]);

  return (
    <div className="airtime-container">
      <div className="icon-circle">📞</div>

      <div className="airtime-card">
        <div className="airtime-header">
          <h2>Purchase Airtime</h2>
          <button className="add-beneficiary-btn">
            ➕ Add Beneficiary
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search Beneficiaries"
            className="search-input"
          />
        </div>

        <div className="beneficiary-list">
          <p className="beneficiary-category">All</p>
          <ul>
            {beneficiaries.map((name, index) => (
              <li key={index} className="beneficiary-item">
                <span>{name}</span>
                <span className="arrow">›</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PurchaseAirtime;
