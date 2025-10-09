import { useNavigate } from "react-router-dom";
import "./BuyAirtime.css";
import { FaArrowLeft, FaPlus, FaSearch, FaPhone } from "react-icons/fa";
import { useState } from "react";
import { useBeneficiaries } from "../context/BeneficiaryContext";

function BuyAirtime() {
  const navigate = useNavigate();

  // Prevents crash if context is not ready
  const context = useBeneficiaries();
  const beneficiaries = context?.beneficiaries ?? [];


  const [search, setSearch] = useState("");

  const filtered = beneficiaries.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="buy-airtime-page">
      <button className="back-icon" onClick={() => navigate("/bill-payments")}>
        <FaArrowLeft />
      </button>

      <div className="buy-airtime-card fade-in">
        <div className="icon-circle">
          <FaPhone />
        </div>

        <h2 className="card-title">Purchase Airtime</h2>
        <hr className="divider" />

        {/* ✅ Add Beneficiary above search bar */}
        <div className="airtime-controls">
          <button
            className="add-beneficiary-btn"
            onClick={() => navigate("/add-beneficiary")}
          >
            <FaPlus /> Add Beneficiary
          </button>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search Beneficiaries"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        <div className="beneficiary-list">
          <h4>All</h4>
          {filtered.length > 0 ? (
            filtered.map((b, i) => (
              <div
                className="beneficiary-item"
                key={i}
                onClick={() => navigate(`/beneficiary-details/${i}`)}
              >
                <span>{b.name}</span>
                <span className="arrow">›</span>
              </div>
            ))
          ) : (
            <p>No beneficiaries found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyAirtime;
