// src/components/EmployeeTopbar.jsx
import { useAccount } from "../context/AccountContext";
import "./Topbar.css";

export default function EmployeeTopbar() {
  const { profile, loading, error } = useAccount();
  const userName = loading
    ? ""
    : (profile?.fullName || profile?.name || "Employee");

  return (
    <div className="topbar">
      <div className="topbar-right" style={{ marginLeft: "auto" }}>
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
