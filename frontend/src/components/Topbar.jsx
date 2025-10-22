import { Link, useLocation } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import "./Topbar.css";

// Safe Base64URL decoder (adds padding and converts URL-safe chars)
function b64UrlDecode(input) {
  try {
    const norm = input.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (norm.length % 4)) % 4;
    const padded = norm + "=".repeat(padLen);
    return atob(padded);
  } catch {
    return "";
  }
}

// Try to read a "name" from the JWT payload so we can greet immediately
function readNameFromToken() {
  try {
    const raw = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!raw) return "";
    const parts = raw.split(".");
    if (parts.length < 2) return "";
    const payloadJson = b64UrlDecode(parts[1]);
    if (!payloadJson) return "";
    const payload = JSON.parse(payloadJson);
    return (payload?.name || payload?.fullName || "").toString().trim();
  } catch {
    return "";
  }
}

export default function Topbar() {
  const { pathname } = useLocation();
  const { profile, loading, error } = useAccount();

  const tokenName = readNameFromToken();

  const userName = loading
    ? ""
    : (profile?.fullName || profile?.name || tokenName || "User");

  // Helpful for debugging profile load issues
  console.log("Profile in Topbar:", JSON.stringify(profile, null, 2));

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
