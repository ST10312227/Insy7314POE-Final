import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css"; // reuse styles

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
        "status-pill " +
        (v === "verified" ? "ok" : v === "declined" || v === "archived" ? "bad" : "pending")
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

        // prefer server id; else stable-ish composite
        const id =
          x.id ||
          x._id?.toString?.() ||
          [
            x.userId ?? "",
            x.accountNumber ?? "",
            x.swiftCode ?? "",
            x.firstName ?? "",
            x.lastName ?? "",
          ].join("|");

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
          customerAccount:
            x.customerAccount ||
            x.customerAccountNumber ||
            x.accountNumber ||
            x.sourceAccount ||
            x?.acct?.number ||
            "—",
          beneficiaryName:
            x.beneficiaryName ||
            x?.beneficiary?.name ||
            x.name ||
            `${x?.beneficiary?.firstName ?? x.firstName ?? ""} ${
              x?.beneficiary?.lastName ?? x.lastName ?? ""
            }`.trim() ||
            "—",
          amountCents: x.amountCents ?? null, // not supplied by this feed
          currency: x.currency || x.curr || "—",
          beneficiaryAccount:
            x.beneficiaryAccount || x?.beneficiary?.accountNumber || x.accountNumber || "—",
          swift: x.swift || x.swiftCode || x?.beneficiary?.swiftCode || "—",
          status,
          _raw: x, // keep original for detail page if needed
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

  // Only show PENDING and apply local search
  const pending = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = rows.filter((r) => (r.status || "").toLowerCase() === "pending");
    if (!term) return base;
    return base.filter((r) =>
      [
        r.customerName,
        r.customerAccount,
        r.beneficiaryName,
        r.currency,
        r.beneficiaryAccount,
        r.swift,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [rows, q]);

  // Row navigation -> detail verification page
  function goDetail(row) {
    if (!row?.id) return;
    navigate(`/employee/approvals/${encodeURIComponent(row.id)}`, {
      state: { item: row }, // pass normalized row for instant render
    });
  }

  function rowKeyDown(e, row) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goDetail(row);
    }
  }

  return (
    <div className="emp-page">
      {/* Sidebar (minimal) */}
      <aside className="emp-sidebar">
        <div className="brand">the<br/>vault</div>

        <div className="sb-item active">
          <div className="sb-icon" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v4H3V3zm0 6h18v12H3V9zm2 2v8h14v-8H5zm2 2h4v4H7v-4z" />
            </svg>
          </div>
          <div className="sb-label">Pending Transactions</div>
        </div>

        <div
          className="sb-item"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/employee/create-user")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/employee/create-user")}
        >
          <div className="sb-icon" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 6v1h16v-1c0-4-4-6-8-6Z"/>
              <path d="M19 10v-2h-2V6h-2v2h-2v2h2v2h2v-2z"/>
            </svg>
          </div>
          <div className="sb-label">Create user</div>
        </div>

        <div className="sb-spacer" />
        <div className="sb-item"><span className="sb-icon dot" /><div className="sb-label">Notifications</div></div>
        <div
          className="sb-item"
          role="button"
          tabIndex={0}
          onClick={() => { localStorage.removeItem("employee_token"); navigate("/employee-login"); }}
        >
          <div className="sb-icon" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 13v-2H7v-2l-5 3 5 3v-2zM20 3H10v2h10v14H10v2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
          <div className="sb-label">Logout</div>
        </div>
      </aside>

      {/* Main */}
      <main className="emp-main">
        <header className="emp-topbar">
          <div />
          <div className="hello">Hello, John Doe!</div>
        </header>

        <section className="card">
          <div className="card-head">
            <div className="title-wrap">
              <h1 className="page-title">Employee Verification</h1>
              <p className="sub">Showing only <strong>Pending</strong> items from intl beneficiaries.</p>
            </div>
            <div className="actions">
              <div className="search">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search"
                  aria-label="Search"
                />
                <button className="icon-btn" aria-label="Search">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-5-5z"/>
                  </svg>
                </button>
              </div>
              <button className="filter-btn" onClick={fetchData} title="Refresh">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 13.65-6.65z"/>
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {loading && <div className="empty" style={{ padding: 24 }}>Loading…</div>}
          {error && !loading && <div className="empty" style={{ padding: 24 }}>Error: {error}</div>}

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
                    {pending.map((r) => (
                      <tr
                        key={r.id}
                        className="row-clickable"
                        role="button"
                        tabIndex={0}
                        onClick={() => goDetail(r)}
                        onKeyDown={(e) => rowKeyDown(e, r)}
                        title="Open verification"
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
                    {pending.length === 0 && (
                      <tr>
                        <td colSpan={8} className="empty">No pending transactions.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="pager">
                <span className="muted">Total pending: {pending.length}</span>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
