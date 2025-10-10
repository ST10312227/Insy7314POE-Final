// src/components/InternationalBeneficiaries.jsx
import React, { useState, useMemo } from "react";
import "./InternationalBeneficiaries.css";
import { useNavigate } from "react-router-dom";
import { useInternational } from "../context/InternationalContext";

export default function InternationalBeneficiaries() {
  const [activeTab, setActiveTab] = useState("Pay");
  const navigate = useNavigate();

  const { items, loading, error } = useInternational();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((b) =>
      [b.firstName, b.lastName, b.country, b.bank, b.accountNumber]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, search]);

  return (
    <div className="intl-section-bg">
      <div className="intl-card">
        <div className="intl-badge">
          <img src="/international.svg" alt="International" style={{ width: 38, height: 38 }} />
        </div>

        <div className="intl-title">International Payments</div>

        <div className="intl-tabs">
          <button className={`intl-tab-btn${activeTab === "Pay" ? " active" : ""}`} onClick={() => setActiveTab("Pay")}>Pay</button>
          <button className={`intl-tab-btn${activeTab === "History" ? " active" : ""}`} onClick={() => setActiveTab("History")}>History</button>
        </div>

        <div className="intl-beneficiaries-content">
          {activeTab === "Pay" ? (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search beneficiaries"
                  className="intl-search"
                />
                <button
                  className="intl-add-beneficiary-btn"
                  onClick={() => navigate("/app/international/add")}
                >
                  Add Beneficiary
                </button>
              </div>

              {loading ? (
                <div className="intl-no-beneficiaries">Loading…</div>
              ) : error ? (
                <div className="intl-no-beneficiaries" style={{ color: "#b10000" }}>{error}</div>
              ) : filtered.length === 0 ? (
                <div className="intl-no-beneficiaries">You have no beneficiaries.</div>
              ) : (
                <div className="intl-history-list">
                  {filtered.map((b) => (
                    <div key={b.id || b._id} className="intl-history-item">
                      <div className="intl-history-text">
                        <span className="intl-history-name">
                          {b.firstName} {b.lastName} — {b.country}
                        </span>
                        <div className="intl-history-date" style={{ opacity: 0.7 }}>
                          {b.bank} · {b.accountNumber}
                        </div>
                      </div>
                      <button
                        className="intl-mini-btn"
                        onClick={() =>
                          navigate("/app/international/confirm", {
                            state: { data: { ...b, amount: '', currency: b.currency || 'USD' } },
                          })
                        }
                      >
                        Pay
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="intl-no-beneficiaries">No history in this demo.</div>
          )}
        </div>
      </div>
    </div>
  );
}
