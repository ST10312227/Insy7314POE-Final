import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const DATA_URL = `${API_BASE}/dashboard/intl-beneficiaries`;

function StatusPill({ value }) {
  const v = (value || "").toLowerCase();
  return (
    <span
      className={
        "status-pill " +
        (v === "verified" ? "ok" : v === "declined" || v === "archived" ? "bad" : "pending")
      }
    >
      {value || "Pending"}
    </span>
  );
}

function centsToMoney(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const n = Number(v) / 100;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(DATA_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("employee_token") || ""}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        navigate("/employee-login", { replace: true });
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText} – ${txt}`);
      }

      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : data?.items || []).map((x) => ({
        // 👇 Prefer the new `name` field from API, then `customerName`
        customerName: x.name || x.customerName || "—",
        customerAccount: x.customerAccount || x.accountNumber || "—",
        beneficiaryName: x.beneficiaryName || x?.beneficiary?.name || "—",
        amountCents: x.amountCents ?? null,
        currency: x.currency || "—",
        beneficiaryAccount: x.beneficiaryAccount || x.accountNumber || "—",
        swift: x.swift || x.swiftCode || "—",
        status: x.status ?? (x.archived ? "Archived" : "Pending"),
        _raw: x,
      }));

      setRows(mapped);
    } catch (e) {
      setError(e?.message || "Failed to load data.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.customerName,
        r.customerAccount,
        r.beneficiaryName,
        r.currency,
        r.beneficiaryAccount,
        r.swift,
        r.status,
        centsToMoney(r.amountCents),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  return (
    <section className="card">
      <div className="card-head">
        <div className="title-wrap">
          <h1 className="pending-page-title">Pending Transactions</h1>
          <p className="pending-page-subtitle">
            Review and verify customer international payments before submitting to SWIFT.
          </p>
        </div>
        <div className="actions">
          <div className="search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search"
            />
            <button className="icon-btn" aria-label="Search"></button>
          </div>
          <button className="refresh-btn" onClick={fetchData} title="Refresh">
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="table-wrap">
          <div className="empty">Loading…</div>
        </div>
      )}
      {error && !loading && (
        <div className="table-wrap">
          <div className="empty">Error: {error}</div>
        </div>
      )}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th>Name</th>
                <th>Customer Account</th>
                <th>Beneficiary Name</th>
                <th>Amount</th>
                <th>Curr.</th>
                <th>Beneficiary Account</th>
                <th>SWIFT co.</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td>{r.customerName}</td>
                  <td>{r.customerAccount}</td>
                  <td>{r.beneficiaryName}</td>
                  <td className="num">{centsToMoney(r.amountCents)}</td>
                  <td>{r.currency}</td>
                  <td>{r.beneficiaryAccount}</td>
                  <td>{r.swift}</td>
                  <td>
                    <StatusPill value={r.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
