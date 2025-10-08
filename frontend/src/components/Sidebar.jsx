import "./DashboardLayout.css";
import logoWhite from "../assets/the_vault_dashboard_logo_white.png";
import searchIcon from "../assets/search.png";
import transferIcon from "../assets/funds_transfer.png";
import historyIcon from "../assets/transaction_history.png";
import bellIcon from "../assets/notification.png";
import logoutIcon from "../assets/logout.png";
import helpIcon from "../assets/help.png";
import "./Sidebar.css";


function Sidebar() {
  return (
    <div className="sidebar">
      <img src={logoWhite} alt="Vault Logo" className="sidebar-logo"/>

      <ul className="sidebar-menu">
        <li>
            
        <img src="/src/assets/search.png" alt="Search" className="sidebar-icon" />
        <p className="sidebar-label">Search</p>
        </li>
        <li>
        <img src="/src/assets/funds_transfer.png" alt="Fund Transfer" className="sidebar-icon" />
        <p className="sidebar-label">Fund Transfer</p>
        </li>
        <li>
        <img src="/src/assets/transaction_history.png" alt="Transaction History" className="sidebar-icon" />
        <p className="sidebar-label">Transaction History</p>
        </li>
    </ul>

      <div className="sidebar-bottom">
    <div>
    <img src="/src/assets/notification.png" alt="Notifications" className="sidebar-bottom-icon" />
    <p className="sidebar-bottom-label">Notifications</p>
    </div>
    <div>
    <img src="/src/assets/logout.png" alt="Logout" className="sidebar-bottom-icon" />
    <p className="sidebar-bottom-label">Logout</p>
    </div>
    <div>
    <img src="/src/assets/help.png" alt="Help" className="sidebar-bottom-icon" />
    <p className="sidebar-bottom-label">Help</p>
    </div>
    </div>
    </div>
  );
}

export default Sidebar;