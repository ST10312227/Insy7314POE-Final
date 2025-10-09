import React from "react";
import "./BuyElectricityWater.css";

export function BuyElectricityWater() {
  return (
    <div className="bew-card-main">
      {/* Title row with add meter */}
      <div className="bew-card-header">
        <span className="bew-card-title">Buy Electricity &amp; Water</span>
        <button className="bew-add-meter">+ Add New Meter</button>
      </div>
      {/* Search */}
      <div className="bew-card-search">
        <input type="text" placeholder="Search Meters" className="bew-search-input" />
      </div>
      {/* Filter buttons and icon */}
      <div className="bew-filters-icon-row">
        <button className="bew-filter-btn bew-filter-active">All</button>
        <button className="bew-filter-btn">Electricity</button>
        <button className="bew-filter-btn">Water</button>
        <div className="bew-icon-circle">
          <svg width="70" height="70" viewBox="0 0 70 70">
            <circle cx="35" cy="35" r="35" fill="#CFD6F8"/>
            <polyline points="40,20 25,41 36,41 34,56 52,30 36,30 40,20" fill="none" stroke="#2B3A7C" strokeWidth="3"/>
          </svg>
        </div>
      </div>
      {/* Meter rows */}
      <div className="bew-meter-list">
        <div className="bew-meter-row">
          <div>
            <div className="bew-meter-name">Doe Home</div>
            <div className="bew-meter-type">Electricity Meter</div>
          </div>
          <button className="bew-meter-arrow">{'>'}</button>
        </div>
        <div className="bew-meter-row">
          <div>
            <div className="bew-meter-name">Doe Home</div>
            <div className="bew-meter-type">Water Meter</div>
          </div>
          <button className="bew-meter-arrow">{'>'}</button>
        </div>
      </div>
    </div>
  );
}

export default BuyElectricityWater;
