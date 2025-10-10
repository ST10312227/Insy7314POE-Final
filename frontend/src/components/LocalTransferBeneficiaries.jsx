import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaSearch, FaUserFriends } from "react-icons/fa";
import { useLocalTransfers } from "../context/LocalTransferContext";
import "./LocalTransferBeneficiaries.css";

export default function LocalTransferBeneficiaries() {
  const navigate = useNavigate();
  const { transfers, loadLocalBeneficiaries } = useLocalTransfers();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        await loadLocalBeneficiaries();
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load beneficiaries.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [loadLocalBeneficiaries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transfers;
    return transfers.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.bank?.toLowerCase().includes(q) ||
        String(b.accountNumber || "").toLowerCase().includes(q)
    );
  }, [transfers, search]);

  return (
    <div className="local-transfer-page">
      <button className="back-icon" onClick={() => navigate("/app/funds-transfer")}>
        <FaArrowLeft />
      </button>

      <div className="local-transfer-card fade-in">
        <div className="icon-circle">
          <FaUserFriends />
        </div>

        <h2 className="card-title">Local Transfer</h2>
        <hr className="divider" />

        <div className="transfer-controls">
          <button className="add-beneficiary-btn" onClick={() => navigate("/app/local-transfer/new")}>
            <FaPlus /> Add Beneficiary
          </button>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search saved beneficiaries"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        {loading ? (
          <p style={{ marginTop: 12 }}>Loading beneficiaries…</p>
        ) : err ? (
          <div style={{ background: "#ffeaea", color: "#a40000", padding: 10, borderRadius: 8 }}>
            {err}
          </div>
        ) : (
          <div className="beneficiary-list">
            <h4>Saved Beneficiaries</h4>
            {filtered.length > 0 ? (
              filtered.map((b) => (
                <div
                  className="beneficiary-item"
                  key={b.id || `${b.bank}-${b.accountNumber}`}
                  onClick={() => navigate("/app/local-transfer/pay", { state: b })}
                >
                  <span>
                    <strong>{b.name}</strong> — {b.bank}
                    <br />
                    <small>{b.accountNumber}</small>
                  </span>
                  <span className="arrow">›</span>
                </div>
              ))
            ) : (
              <p>No beneficiaries found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
