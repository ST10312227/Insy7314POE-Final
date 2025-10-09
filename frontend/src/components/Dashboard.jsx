import "./Dashboard.css";
import {
  FaSearch,
  FaFileInvoice,
  FaPaperPlane,
  FaEllipsisH,
  FaPlus,
  FaMoneyBillWave,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2 className="welcome-text">
        Welcome Back to <span>The Vault Bank!</span>
      </h2>
      <p className="subtitle">What would you like to do?</p>

      <div className="dashboard-grid">
        {/* Debit Card Account */}
        <div className="dashboard-card account-card">
          <h3>Debit Card Account</h3>
          <div className="card-row">
            <div className="card-graphic">
              <div className="card-chip"></div>
            </div>
            <div className="add-card">
              <FaPlus className="add-icon" />
              <p>Add Card</p>
            </div>
          </div>
        </div>

        {/* Total Balance */}
        <div className="dashboard-card balance-card">
          <h3>Your Total Balance</h3>
          <h1 className="balance-amount">R105,520.50</h1>
          <p className="balance-date">August 28, 2025 | 02:50 PM</p>

          <div className="balance-actions">
            <div className="action">
              <FaFileInvoice />
              <p>Print Statement</p>
            </div>
            <div className="action">
              <FaPaperPlane />
              <p>Send</p>
            </div>
            <div className="action">
              <FaEllipsisH />
              <p>More</p>
            </div>
          </div>
        </div>

        {/* ✅ Bill Payments Card (Link to /app/bill-payments) */}
        <Link
          to="/app/bill-payments"
          className="dashboard-card white-card"
          style={{
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          <h3>
            <FaMoneyBillWave style={{ marginRight: "8px", color: "#1d2f7c" }} />
            Bill Payments
          </h3>
          <p>Pay utilities, airtime, and subscriptions in one place.</p>
        </Link>

        {/* Recent Transactions */}
        <div className="dashboard-card transactions-card">
          <h3>Recent Transactions</h3>
          <div className="transactions-header">
            <div className="search">
              <FaSearch />
            </div>
            <button className="filter-btn">Last 7 Days</button>
          </div>

          <div className="transactions-list">
            <div className="transaction-item">
              <p>
                <strong>iTunes – Apple Music</strong>
                <br />
                <span>22 August 2025, 08:20 AM</span>
              </p>
              <span className="amount">R850,00</span>
            </div>
            <div className="transaction-item">
              <p>
                <strong>Nandos Flame Grilled Chicken</strong>
                <br />
                <span>21 August 2025, 11:50 PM</span>
              </p>
              <span className="amount">R350,99</span>
            </div>
          </div>

          <p className="see-more">
            <Link to="/app/transaction-history">See All</Link>
          </p>
        </div>

        {/* Income vs Expense */}
        <div className="dashboard-card chart-card">
          <h3>Income vs Expense</h3>
          <div className="chart-placeholder">
            <div className="donut"></div>
            <div className="legend">
              <p>
                <span className="dot income"></span> Income 71.4%
              </p>
              <p>
                <span className="dot expense"></span> Expenses 28.6%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
