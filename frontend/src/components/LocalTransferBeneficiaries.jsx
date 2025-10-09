import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaSearch, FaUserFriends } from "react-icons/fa";
import { useState } from "react";
import { useBeneficiaries } from "../context/BeneficiaryContext"; // ✅ reuse same context
import { useLocalTransfers } from "../context/LocalTransferContext";
import "./LocalTransferBeneficiaries.css";

function LocalTransferBeneficiaries() {
  const navigate = useNavigate();
  const { beneficiaries } = useBeneficiaries();
  const { transfers } = useLocalTransfers();
  
  const [search, setSearch] = useState("");

  const filtered = beneficiaries.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="local-transfer-page">
      <button className="back-icon" onClick={() => navigate("/funds-transfer")}>
        <FaArrowLeft />
      </button>

      <div className="local-transfer-card fade-in">
        <div className="icon-circle">
          <FaUserFriends />
        </div>

        <h2 className="card-title">Local Transfer</h2>
        <hr className="divider" />

        <div className="transfer-controls">
          <button
            className="add-beneficiary-btn"
            onClick={() => navigate("/local-transfer/add")}
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
          <h4>Saved Beneficiaries</h4>
          {filtered.length > 0 ? (
            filtered.map((b, i) => (
              <div
                className="beneficiary-item"
                key={i}
                onClick={() => navigate(`/local-transfer/add?id=${i}`)}
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

export default LocalTransferBeneficiaries;
