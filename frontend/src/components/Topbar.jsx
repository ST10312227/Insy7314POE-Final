import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Topbar.css";

function Topbar() {
  const location = useLocation();
  const activePath = location.pathname;
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // load user name from localStorage
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <Link
          to="/app/dashboard"
          className={`topbar-link ${
            activePath === "/app/dashboard" ? "active" : ""
          }`}
        >
          Dashboard
        </Link>

        <Link
          to="/app/bill-payments"
          className={`topbar-link ${
            activePath === "/app/bill-payments" ? "active" : ""
          }`}
        >
          Bill Payments
        </Link>

        <Link
          to="/app/account-details"
          className={`topbar-link ${
            activePath === "/app/account-details" ? "active" : ""
          }`}
        >
          Account Details
        </Link>
      </div>

      <div className="topbar-right">
        <span className="topbar-user">Hello, {userName}!</span>
      </div>
    </div>
  );
}

export default Topbar;
