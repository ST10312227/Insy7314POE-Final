import { Link, useLocation } from "react-router-dom";
import "./Topbar.css";

function Topbar() {
  const location = useLocation();
  const activePath = location.pathname;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <Link
          to="/dashboard"
          className={`topbar-link ${activePath === "/dashboard" ? "active" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          to="/bill-payments"
          className={`topbar-link ${activePath === "/bill-payments" ? "active" : ""}`}
        >
          Bill Payments
        </Link>
        <Link
          to="/account-details"
          className={`topbar-link ${activePath === "/account-details" ? "active" : ""}`}
        >
          Account Details
        </Link>
      </div>

      <div className="topbar-right">
        <span className="topbar-user">Hello, John Doe!</span>
      </div>
    </div>
  );
}

export default Topbar;