// src/components/EmployeeDashboard.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
// Pull directly from intl_beneficiaries (no transactions)
const DATA_URL = `${API_BASE}/dashboard/intl-beneficiaries`;

function StatusPill({ value }) {
  const v = (value || "").toLowerCase();
  return (
    <span
      className={
        "status-pill " +
        (v === "verified"
          ? "ok"
          : v === "declined"
          ? "bad"
          : v === "archived"
          ? "bad"
          : "pending")
      }
    >
      {value || "Pending"}
    </span>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  function handleKeyDown(e) {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }
  return (
    <div
      className={"sb-item " + (active ? "active" : "")}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-current={active ? "page" : undefined}
    >
      <div className="sb-icon" aria-hidden>
        {icon}
      </div>
      <div className="sb-label">{label}</div>
    </div>
  );
}

function centsToMoney(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const n = Number(v) / 100;
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
        throw new Error(`Failed to load: ${res.status} ${res.statusText} – ${txt}`);
      }

      const data = await res.json();

      const mapped = (Array.isArray(data) ? data : data?.items || []).map((x) => {
        const status = x.status ?? (x.archived === true ? "Archived" : "Pending");
        return {
          customerName:
            x.customerName ||
            x.name ||
            x.userName ||
            `${x.firstName ?? ""} ${x.lastName ?? ""}`.trim() ||
            "—",
          customerAccount:
            x.customerAccount ||
            x.customerAccountNumber ||
            x.accountNumber ||
            x.sourceAccount ||
            "—",
          beneficiaryName:
            x.beneficiaryName ||
            x?.beneficiary?.name ||
            x.name ||
            `${x?.beneficiary?.firstName ?? x.firstName ?? ""} ${x?.beneficiary?.lastName ?? x.lastName ?? ""}`.trim() ||
            "—",
          amountCents: x.amountCents ?? null, // renders as "—"
          currency: x.currency || x.curr || "—",
          beneficiaryAccount:
            x.beneficiaryAccount ||
            x?.beneficiary?.accountNumber ||
            x.accountNumber ||
            "—",
          swift: x.swift || x.swiftCode || x?.beneficiary?.swiftCode || "—",
          status,
          _raw: x,
        };
      });

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
    <div className="emp-page">
      {/* Sidebar */}
      <aside className="emp-sidebar">
        <div className="brand">
          the
          <br />
          vault
        </div>

        {/* Make this navigate to the approvals page */}
        <SidebarItem
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v4H3V3zm0 6h18v12H3V9zm2 2v8h14v-8H5zm2 2h4v4H7v-4z" />
            </svg>
          }
          label="Pending Transactions"
          onClick={() => navigate("/employee/approvals")}
        />

        <SidebarItem
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 6v1h16v-1c0-4-4-6-8-6Z" />
              <path d="M19 10v-2h-2V6h-2v2h-2v2h2v2h2v-2z" />
            </svg>
          }
          label="Create user"
          onClick={() => navigate("/employee/create-user")}
        />

        <div className="sb-spacer" />

        <SidebarItem icon={<span className="dot" />} label="Notifications" />
        <SidebarItem
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 13v-2H7v-2l-5 3 5 3v-2zM20 3H10v2h10v14H10v2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
            </svg>
          }
          label="Logout"
          onClick={() => {
            localStorage.removeItem("employee_token");
            navigate("/employee-login");
          }}
        />
        <SidebarItem
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92A3.49 3.49 0 0 0 13 15h-2v-.5c0-1 .5-1.5 1.1-2.1l1.2-1.2a1.5 1.5 0 1 0-2.6-1 1 0 0 1-1.9-.6A3.5 3.5 0 1 1 15.07 11.25z" />
            </svg>
          }
          label="Help"
        />
      </aside>

      {/* Main content */}
      <main className="emp-main">
        <header className="emp-topbar">
          <div />
          <div className="hello">Hello, Jane Doe!</div>
        </header>

        <section className="card">
          <div className="card-head">
            <div className="title-wrap">
              <h1 className="page-title">
                <span>Pending Transactions</span>
                <span className="pipe">|</span>
                <span className="linkish">International Payments</span>
              </h1>
              <p className="sub">
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
                <button className="icon-btn" aria-label="Search">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </button>
              </div>

              <button className="filter-btn" onClick={fetchData} title="Refresh">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 13.65-6.65z" />
                </svg>
                <span>Refresh</span>
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
            <>
              <div className="table-wrap">
                <table className="grid">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Customer Account</th>
                      <th>Beneficiary Name</th>
                      <th>Amount.</th>
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
                        <td><StatusPill value={r.status} /></td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="empty">No results.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pager">
                <span className="dot active" />
                <span className="dot" />
                <span className="dot" />
                <svg className="caret" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
