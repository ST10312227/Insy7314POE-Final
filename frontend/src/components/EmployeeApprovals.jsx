import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css"; // reuse existing styles

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const DATA_URL = `${API_BASE}/dashboard/intl-beneficiaries`;

function Money({ cents, currency }) {
  if (cents == null || Number.isNaN(cents)) return <span>—</span>;
  const n = Number(cents) / 100;
  return (
    <span className="num">
      {n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
      <span className="muted">{currency || ""}</span>
    </span>
  );
}

function StatusPill({ value }) {
  const v = (value || "").toLowerCase();
  return (
    <span
      className={
        "status-pill " + (v === "verified" ? "ok" : v === "declined" || v === "archived" ? "bad" : "pending")
      }
    >
      {value || "Pending"}
    </span>
  );
}

export default function EmployeeApprovals() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${DATA_URL}?_=${Date.now()}`, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          Pragma: "no-cache",
          Authorization: `Bearer ${localStorage.getItem("employee_token") || ""}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        navigate("/employee-login", { replace: true });
        return;
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const data = await res.json();
      const src = Array.isArray(data) ? data : data?.items || [];

      const mapped = src.map((x) => {
        const status = x.status ?? (x.archived === true ? "Archived" : "Pending");
        const id =
          x.id ||
          x._id?.toString?.() ||
          [x.userId ?? "", x.accountNumber ?? "", x.swiftCode ?? "", x.firstName ?? "", x.lastName ?? ""].join("|");

        return {
          id,
          customerName:
            x.customerName ||
            x.name ||
            x.userName ||
            `${x.firstName ?? ""} ${x.lastName ?? ""}`.trim() ||
            x?.user?.fullName ||
            `${x?.user?.firstName ?? ""} ${x?.user?.lastName ?? ""}`.trim() ||
            "—",
          customerAccount: x.customerAccount || x.accountNumber || "—",
          beneficiaryName: x.beneficiaryName || x?.beneficiary?.name || "—",
          amountCents: x.amountCents ?? null,
          currency: x.currency || "—",
          beneficiaryAccount: x.beneficiaryAccount || x.accountNumber || "—",
          swift: x.swift || x.swiftCode || x?.beneficiary?.swiftCode || "—",
          status,
        };
      });

      setRows(mapped);
    } catch (e) {
      setError(e?.message || "Failed to load.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pending = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = rows.filter((r) => (r.status || "").toLowerCase() === "pending");
    if (!term) return base;
    return base.filter((r) =>
      [r.customerName, r.customerAccount, r.beneficiaryName, r.currency, r.beneficiaryAccount, r.swift]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [rows, q]);

  const goDetail = (row) => {
    if (!row?.id) return;
    navigate(`/employee/approvals/${encodeURIComponent(row.id)}`, { state: { item: row } });
  };

  return (
    <section className="card">
      <div className="card-head">
        <div className="title-wrap">
          <h1 className="approvals-title">Employee Verification</h1>
          <p className="approvals-subtitle">Showing only <strong>Pending</strong> items from intl beneficiaries.</p>
        </div>
        <div className="actions">
          <div className="search">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search" />          </div>
          <button className="refresh-btn" onClick={fetchData} title="Refresh">Refresh</button>
        </div>
      </div>

      {loading && <div className="empty" style={{ padding: 24 }}>Loading…</div>}
      {error && !loading && <div className="empty" style={{ padding: 24 }}>Error: {error}</div>}

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
              {pending.map((r) => (
                <tr
                  key={r.id}
                  className="row-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => goDetail(r)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{r.customerName}</td>
                  <td>{r.customerAccount}</td>
                  <td>{r.beneficiaryName}</td>
                  <td><Money cents={r.amountCents} currency={r.currency} /></td>
                  <td>{r.currency}</td>
                  <td>{r.beneficiaryAccount}</td>
                  <td>{r.swift}</td>
                  <td><StatusPill value={r.status} /></td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan={8} className="empty">No pending transactions.</td></tr>}
            </tbody>
          </table>
          <div className="pager"><span className="muted">Total pending: {pending.length}</span></div>
        </div>
      )}
    </section>
  );
}
