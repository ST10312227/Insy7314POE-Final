// src/components/EmployeeSwiftVerification.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./EmployeeDashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const LIST_URL  = `${API_BASE}/dashboard/intl-beneficiaries`;
const PATCH_URL = (id) => `${API_BASE}/dashboard/intl-payments/${id}/status`; // keep as-is if you later approve real payments

function Row({ k, v }) {
  return (
    <div className="fx-row" style={{ display: "flex", gap: 24, padding: "6px 0" }}>
      <div style={{ width: 180, color: "var(--muted,#6b7280)" }}>{k}</div>
      <div style={{ fontWeight: 500 }}>{v || "—"}</div>
    </div>
  );
}

export default function EmployeeSwiftVerification() {
  const { id } = useParams();                                // /employee/approvals/:id
  const { state } = useLocation();                           // preferred: item passed via navigate
  const navigate = useNavigate();

  const [item, setItem] = useState(state?.item || null);
  const [loading, setLoading] = useState(!state?.item);
  const [err, setErr] = useState("");
  const [updating, setUpdating] = useState(false);

  const mapFromSource = useCallback((x) => {
    if (!x) return null;
    const status = x.status ?? (x.archived === true ? "Archived" : "Pending");
    const customerName =
      x.customerName || x.name || `${x.firstName ?? ""} ${x.lastName ?? ""}`.trim();
    const beneficiaryName =
      x.beneficiaryName ||
      x?.beneficiary?.name ||
      `${x?.beneficiary?.firstName ?? x.firstName ?? ""} ${x?.beneficiary?.lastName ?? x.lastName ?? ""}`.trim();
    return {
      id: x.id || x._id || id,
      customerName: customerName || "—",
      customerAccount: x.customerAccount || x.accountNumber || x.sourceAccount || "—",
      beneficiaryName: beneficiaryName || "—",
      bank: x.bank || x?.beneficiary?.bank || "—",
      beneficiaryAccount: x.beneficiaryAccount || x?.beneficiary?.accountNumber || x.accountNumber || "—",
      swift: x.swift || x.swiftCode || x?.beneficiary?.swiftCode || "—",
      amountCents: x.amountCents ?? null, // often not present in this feed
      currency: x.currency || x.curr || "—",
      createdAt: x.createdAt || x.submittedAt || null,
      status,
      _raw: x,
    };
  }, [id]);

  // If item not passed via state, fetch the list and try to find one that matches :id
  useEffect(() => {
    let alive = true;
    async function run() {
      if (state?.item) return; // already set
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`${LIST_URL}?_=${Date.now()}`, {
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
        const arr = Array.isArray(data) ? data : data?.items || [];

        // try match by id or _id
        const found = arr.find((r) => String(r._id || r.id) === id) || arr[0]; // fallback: first
        if (alive) setItem(mapFromSource(found));
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load record.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (!item) run();
    return () => { alive = false; };
  }, [id, item, mapFromSource, navigate, state?.item]);

  const money = useMemo(() => {
    if (!item?.amountCents && item?.amountCents !== 0) return "—";
    const n = Number(item.amountCents) / 100;
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [item]);

  async function setStatus(next) {
    if (!item?.id) {
      alert("Missing payment id to update. (You can still style/demo this screen.)");
      return;
    }
    try {
      setUpdating(true);
      const res = await fetch(PATCH_URL(item.id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("employee_token") || ""}`,
        },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText} – ${txt}`);
      }
      // Success — go back to approvals list
      navigate("/employee/approvals", { replace: true });
    } catch (e) {
      alert(e.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="emp-page">
      <aside className="emp-sidebar">
        <div className="brand">the<br/>vault</div>
        <div className="sb-item" role="button" tabIndex={0} onClick={() => navigate("/employee/approvals")}>
          <div className="sb-icon" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v4H3V3zm0 6h18v12H3V9zm2 2v8h14v-8H5zm2 2h4v4H7v-4z" />
            </svg>
          </div>
          <div className="sb-label">Pending Transactions</div>
        </div>
        <div className="sb-item" role="button" tabIndex={0} onClick={() => navigate("/employee/create-user")}>
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
        <div className="sb-item" role="button" tabIndex={0} onClick={() => { localStorage.removeItem("employee_token"); navigate("/employee-login"); }}>
          <div className="sb-icon" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 13v-2H7v-2l-5 3 5 3v-2zM20 3H10v2h10v14H10v2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
          <div className="sb-label">Logout</div>
        </div>
      </aside>

      <main className="emp-main">
        <header className="emp-topbar">
          <button className="icon-btn" aria-label="Back" onClick={() => navigate(-1)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="hello">Hello, John Doe!</div>
        </header>

        <section className="card">
          <div className="card-head">
            <div className="title-wrap">
              <h1 className="page-title">Employee Verification</h1>
              <p className="sub">Review pending transactions, approve or reject.</p>
            </div>
          </div>

          {loading && <div className="empty" style={{ padding: 24 }}>Loading…</div>}
          {err && !loading && <div className="empty" style={{ padding: 24 }}>Error: {err}</div>}

          {!loading && !err && item && (
            <div style={{ display: "grid", placeItems: "center" }}>
              {/* framed panel */}
              <div style={{
                width: "min(880px, 100%)",
                border: "3px solid rgba(29,78,216,0.25)",
                borderRadius: 16,
                padding: "28px 28px 22px",
                position: "relative",
                background: "white",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
              }}>
                {/* top badge */}
                <div style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  top: 0,
                  background: "#E11D48",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 700
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 4v6c0 5-3.8 9.7-9 10-5.2-.3-9-5-9-10V6l9-4zm-1 12l6-6-1.4-1.4L11 10.2 8.4 7.6 7 9l4 5z"/></svg>
                  Verify SWIFT Payment
                </div>

                <div style={{ height: 6 }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 28, rowGap: 4, marginTop: 12 }}>
                  <Row k="Customer Name"       v={item.customerName} />
                  <Row k="Customer Account"    v={item.customerAccount} />
                  <Row k="Beneficiary Name"    v={item.beneficiaryName} />
                  <Row k="Beneficiary Bank"    v={item.bank} />
                  <Row k="Beneficiary Account" v={item.beneficiaryAccount} />
                  <Row k="SWIFT Code"          v={item.swift} />
                  <Row k="Amount"              v={item.amountCents != null ? (Number(item.amountCents)/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) : "—"} />
                  <Row k="Currency"            v={item.currency} />
                  <Row k="Date Submitted"      v={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"} />
                  <Row k="Status"              v={item.status} />
                </div>

                <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
                  <button className="primary" disabled={updating} onClick={() => setStatus("Verified")}>
                    {updating ? "Updating…" : "Approve"}
                  </button>
                  <button className="secondary" disabled={updating} onClick={() => setStatus("Declined")}>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
