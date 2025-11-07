// src/components/EmployeeSidebar.jsx
import logoWhite from "../assets/the_vault_dashboard_logo_white.png";
import pendingIcon from "../assets/pending_transactions.png";
import accountIcon from "../assets/account_details.png";
import bellIcon from "../assets/notification.png";
import logoutIcon from "../assets/logout.png";
import helpIcon from "../assets/help.png";
import dashboardIcon from "../assets/dashboard_icon1.png";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import "./Sidebar.css";
import "./EmployeeSidebar.css";

export default function EmployeeSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const isActiveBottom = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      {/* Logo */}
      <img src={logoWhite} alt="Vault Logo" className="sidebar-logo" />

      {/* === Menu === */}
      
      <ul className="sidebar-menu">

        {/* === DASHBOARD === */}
         <li>
          <NavLink
            to="/employee/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
            end
          >
            <img src={dashboardIcon} alt="Dashboard" className="sidebar-icon3" />
            <p className="sidebar-label">Employee Dashboard</p>
          </NavLink>
        </li>

        {/* === PENDING TRANSACTIONS === */}
        <li>
          <NavLink
            to="/employee/pending-transactions"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={pendingIcon} alt="Pending Transactions" className="sidebar-icon1" />
            <p className="sidebar-label">Pending Transactions</p>
          </NavLink>
        </li>

        {/* === CREATE USER === */}
         <li>
            <NavLink
            to="/employee/create-user"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={accountIcon} alt="Create User" className="sidebar-icon2" />
            <p className="sidebar-label">Create User</p>
          </NavLink>
        </li>
      </ul>

      {/* === Bottom Section === */}
      <div className="sidebar-bottom">
        <div>
          <img src={bellIcon} alt="Notifications" className="sidebar-bottom-icon" />
          <p className="sidebar-bottom-label">Notifications</p>
        </div>

        <div onClick={handleLogout}>
          <img src={logoutIcon} alt="Logout" className="sidebar-bottom-icon" />
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
