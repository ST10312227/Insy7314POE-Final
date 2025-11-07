// src/components/EmployeeSwiftVerification.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./EmployeeDashboard.css";
import "./EmployeeSwiftVerification.css";
import whiteBackground from "../assets/white_background.png";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const LIST_URL  = `${API_BASE}/dashboard/intl-beneficiaries`;
const PATCH_URL = (id) => `${API_BASE}/dashboard/intl-beneficiaries/${id}/status`;

function buildKey(x) {
  return (
    x?._id?.toString?.() ||
    x?.id ||
    [x?.userId ?? "", x?.accountNumber ?? "", x?.swiftCode ?? "", x?.firstName ?? "", x?.lastName ?? ""].join("|")
  );
}

function Row({ k, v }) {
  return (
    <div className="fx-row" style={{ display: "flex", gap: 24, padding: "6px 0" }}>
      <div style={{ width: 180, color: "#6b7280" }}>{k}</div>
      <div style={{ fontWeight: 600, color: "#111827" }}>{(v ?? "") !== "" ? v : "—"}</div>
    </div>
  );
}

export default function EmployeeSwiftVerification() {
  const { id: rawId } = useParams();
  const id = decodeURIComponent(rawId || "");
  const { state } = useLocation();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [updating, setUpdating] = useState(false);

  const mapFromSource = useCallback((x) => {
    if (!x) return null;
    const status = x.status ?? (x.archived === true ? "Archived" : "Pending");
    const customerName =
      x.customerName ||
      x.name ||
      x.userName ||
      `${x.firstName ?? ""} ${x.lastName ?? ""}`.trim() ||
      x?.user?.fullName ||
      `${x?.user?.firstName ?? ""} ${x?.user?.lastName ?? ""}`.trim();

    const beneficiaryName =
      x.beneficiaryName ||
      x?.beneficiary?.name ||
      `${x?.beneficiary?.firstName ?? x.firstName ?? ""} ${x?.beneficiary?.lastName ?? x.lastName ?? ""}`.trim();

    return {
      id: buildKey(x),
      customerName: customerName || "—",
      customerAccount: x.customerAccount || x.accountNumber || x.sourceAccount || x?.acct?.number || "—",
      beneficiaryName: beneficiaryName || "—",
      bank: x.bank || x?.beneficiary?.bank || "—",
      beneficiaryAccount: x.beneficiaryAccount || x?.beneficiary?.accountNumber || x.accountNumber || "—",
      swift: x.swift || x.swiftCode || x?.beneficiary?.swiftCode || "—",
      amountCents: x.amountCents ?? null,
      currency: x.currency || x.curr || "—",
      createdAt: x.createdAt || x.submittedAt || null,
      status,
      _raw: x,
    };
  }, []);

  // Instant render if we came from the list with state
  useEffect(() => {
    if (state?.item) {
      setItem(mapFromSource(state.item));
      setLoading(false);
      setErr("");
    }
  }, [state?.item, mapFromSource]);

  // Deep link / refresh
  useEffect(() => {
    if (state?.item) return;
    let alive = true;
    (async () => {
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
        const found =
          arr.find((r) => String(r._id || r.id) === id) ||
          arr.find((r) => buildKey(r) === id) || null;

        if (!found && alive) setErr("Record not found.");
        if (found && alive) setItem(mapFromSource(found));
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load record.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, navigate, state?.item, mapFromSource]);

  const money = useMemo(() => {
    if (item?.amountCents == null) return "—";
    const n = Number(item.amountCents) / 100;
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [item]);

  async function setStatus(next) {
    if (!item?.id) {
      alert("Missing payment id to update.");
      return;
    }
    try {
      setUpdating(true);
      const res = await fetch(PATCH_URL(encodeURIComponent(item.id)), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("employee_token") || ""}`,
        },
        body: JSON.stringify({ status: next }),
      });

      // if token expired mid-session, bounce to login
      if (res.status === 401 || res.status === 403) {
        navigate("/employee-login", { replace: true });
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText} – ${txt}`);
      }

      // give Mongo a tick to persist (avoids flicker) then go to dashboard
      setTimeout(() => {
        navigate("/employee/dashboard", { replace: true });
      }, 120);
    } catch (e) {
      alert(e.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="emp-verification-page" style={{ backgroundImage: `url(${whiteBackground})` }}>
      <section className="emp-verification-card">
        <div className="emp-verification-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l9 4v6c0 5-3.8 9.7-9 10-5.2-.3-9-5-9-10V6l9-4zm-1 12l6-6-1.4-1.4L11 10.2 8.4 7.6 7 9l4 5z" />
          </svg>
          Verify SWIFT Payment
        </div>

        <div className="emp-verification-title">
          <h1 className="page-title">Employee Verification</h1>
          <p className="sub">Review pending transactions, approve or reject.</p>
        </div>

        {loading && <div className="empty" style={{ padding: 24, color: "#fff" }}>Loading…</div>}
        {err && !loading && <div className="empty" style={{ padding: 24, color: "#fff" }}>Error: {err}</div>}

        {!loading && !err && item && (
          <div className="emp-verification-grid">
            <Row k="Customer Name" v={item.customerName} />
            <Row k="Customer Account" v={item.customerAccount} />
            <Row k="Beneficiary Name" v={item.beneficiaryName} />
            <Row k="Beneficiary Bank" v={item.bank} />
            <Row k="Beneficiary Account" v={item.beneficiaryAccount} />
            <Row k="SWIFT Code" v={item.swift} />
            <Row k="Amount" v={money} />
            <Row k="Currency" v={item.currency} />
            <Row k="Date Submitted" v={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"} />
            <Row k="Status" v={item.status} />

            <div className="emp-verification-buttons">
              <button type="button" className="primary" disabled={updating} onClick={() => setStatus("Verified")}>
                {updating ? "Updating…" : "Approve"}
              </button>
              <button type="button" className="secondary" disabled={updating} onClick={() => setStatus("Declined")}>
                Reject
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
