import { useNavigate } from "react-router-dom";
import "./BuyAirtime.css";
import { FaArrowLeft, FaPlus, FaSearch, FaPhone } from "react-icons/fa";
import { useState } from "react";
import { useBeneficiaries } from "../context/BeneficiaryContext";

function BuyAirtime() {
  const navigate = useNavigate();

  // Safe access to context
  const { beneficiaries = [] } = useBeneficiaries() ?? {};

  const [search, setSearch] = useState("");
  const filtered = beneficiaries.filter((b) =>
    (b.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="buy-airtime-page">
      {/* go back inside the /app shell */}
      <button className="back-icon" onClick={() => navigate("/app/bill-payments")}>
        <FaArrowLeft />
      </button>

      <div className="buy-airtime-card fade-in">
        <div className="icon-circle">
          <FaPhone />
        </div>

        <h2 className="card-title">Purchase Airtime</h2>
        <hr className="divider" />

        <div className="airtime-controls">
          {/* open the add form under /app */}
          <button
            className="add-beneficiary-btn"
            onClick={() => navigate("/app/add-beneficiary")}
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
                onClick={() => navigate(`/app/beneficiary-details/${i}`)}
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
