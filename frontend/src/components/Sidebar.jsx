import "./DashboardLayout.css";
import logoWhite from "../assets/the_vault_dashboard_logo_white.png";
import searchIcon from "../assets/search.png";
import transferIcon from "../assets/funds_transfer.png";
import historyIcon from "../assets/transaction_history.png";
import bellIcon from "../assets/notification.png";
import logoutIcon from "../assets/logout.png";
import helpIcon from "../assets/help.png";
import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <img src={logoWhite} alt="Vault Logo" className="sidebar-logo" />

      {/* === Top Menu === */}
      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/app/search"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={searchIcon} alt="Search" className="sidebar-icon" />
            <p className="sidebar-label">Search</p>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/app/funds-transfer"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img
              src={transferIcon}
              alt="Funds Transfer"
              className="sidebar-icon"
            />
            <p className="sidebar-label">Fund Transfer</p>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/app/transaction-history"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img
              src={historyIcon}
              alt="Transaction History"
              className="sidebar-icon"
            />
            <p className="sidebar-label">Transaction History</p>
          </NavLink>
        </li>
      </ul>

      {/* === Bottom Section === */}
      <div className="sidebar-bottom">
        <div>
          <img
            src={bellIcon}
            alt="Notifications"
            className="sidebar-bottom-icon"
          />
          <p className="sidebar-bottom-label">Notifications</p>
        </div>

        <div onClick={handleLogout} style={{ cursor: "pointer" }}>
          <img
            src={logoutIcon}
            alt="Logout"
            className="sidebar-bottom-icon"
          />
          <p className="sidebar-bottom-label">Logout</p>
        </div>

        <div>
          <img src={helpIcon} alt="Help" className="sidebar-bottom-icon" />
          <p className="sidebar-bottom-label">Help</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
