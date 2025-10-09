import { useNavigate } from "react-router-dom";
import "./AirtimeShared.css";
import { FaArrowLeft, FaPlus, FaSearch, FaPhone } from "react-icons/fa";
import { useState } from "react";
import { useBeneficiaries } from "../context/BeneficiaryContext"; // ✅ import context

function BuyAirtime() {
  const navigate = useNavigate();
  const { beneficiaries } = useBeneficiaries(); // ✅ access list
  const [search, setSearch] = useState("");

  const filtered = beneficiaries.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="buy-airtime-container">
      <div className="airtime-header">
        <button className="back-btn" onClick={() => navigate("/bill-payments")}>
          <FaArrowLeft />
        </button>
        <div className="airtime-icon">
          <FaPhone />
        </div>
      </div>

      <h2 className="airtime-title">
        Purchase <span>Airtime</span>
      </h2>

      <div className="add-beneficiary-row">
        <button
          className="add-beneficiary-btn"
          onClick={() => navigate("/add-beneficiary")}
        >
          <FaPlus /> Add Beneficiary
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search Beneficiaries"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FaSearch className="search-icon" />
      </div>

      <div className="beneficiary-list">
        <h4>All</h4>
        {filtered.length > 0 ? (
          filtered.map((b, i) => (
      <div
        className="beneficiary-item"
        key={i}
        onClick={() => navigate(`/beneficiary-details/${i}`)} // ✅ pass index
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
  );
}

export default BuyAirtime;
