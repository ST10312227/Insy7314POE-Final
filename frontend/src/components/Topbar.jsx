// src/components/Topbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import "./Topbar.css";

export default function Topbar() {
  const { pathname } = useLocation();
  const { profile, loading, error } = useAccount();

  const userName = loading
    ? ""
    : profile?.fullName || profile?.name || "User";

  return (
    <div className="topbar">
      <div className="topbar-left">
        <Link
          to="/app/dashboard"
          className={`topbar-link ${pathname === "/app/dashboard" ? "active" : ""}`}
        >
          Dashboard
        </Link>

        <Link
          to="/app/bill-payments"
          className={`topbar-link ${pathname === "/app/bill-payments" ? "active" : ""}`}
        >
          Bill Payments
        </Link>

        <Link
          to="/app/account-details"
          className={`topbar-link ${pathname === "/app/account-details" ? "active" : ""}`}
        >
          Account Details
        </Link>
      </div>

      <div className="topbar-right">
        {error ? (
          <span className="topbar-user" style={{ color: "#b10000" }}>
            {error}
          </span>
        ) : (
          <span className="topbar-user">
            {loading ? "Loading…" : `Hello, ${userName}!`}
          </span>
        )}
      </div>
    </div>
  );
}
