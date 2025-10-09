import React, { useState } from "react";
import "./TransactionHistory.css";
import { FaSearch, FaFilter } from "react-icons/fa";

function TransactionHistory() {
  const [showSearch, setShowSearch] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const transactions = [
    { name: "Cotton On", date: "22 August 2025", time: "13:57 PM", amount: "R1985,55" },
    { name: "Woolworths", date: "15 July 2025", time: "14:01 PM", amount: "R550,52" },
    { name: "Clicks ZA", date: "10 December 2024", time: "14:10 PM", amount: "R950,00" },
    { name: "Foschini", date: "9 January 2025", time: "15:30 PM", amount: "R350,00" },
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const years = ["2023", "2024", "2025"];

  // === FILTER & SEARCH ===
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedMonth && !t.date.toLowerCase().includes(selectedMonth.toLowerCase())) return false;
    if (selectedYear && !t.date.includes(selectedYear)) return false;

    return matchesSearch;
  });

  return (
    <div className="transactions-container">
      <h2 className="transactions-title">
        Transaction <span>History</span>
      </h2>
      <p className="transactions-subtitle">
        View a complete record of your transactions with easy filters to track your money anytime.
      </p>

      {/* === Header Buttons === */}
      <div className="transactions-header">
        <button className="search-btn" onClick={() => setShowSearch(true)}>
          <FaSearch /> Search
        </button>

        <div className="filter-dropdown">
          <button
            className="filter-btn"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <FaFilter /> Filter
          </button>

          {filterOpen && (
            <div className="filter-menu">
              <p className="filter-label">Filter by Month</p>
              <select
                onChange={(e) => setSelectedMonth(e.target.value)}
                value={selectedMonth}
              >
                <option value="">-- Select Month --</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <p className="filter-label">Filter by Year</p>
              <select
                onChange={(e) => setSelectedYear(e.target.value)}
                value={selectedYear}
              >
                <option value="">-- Select Year --</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <div className="filter-buttons">
                <button className="apply-btn" onClick={() => setFilterOpen(false)}>Apply</button>
                <button className="cancel-btn" onClick={() => {
                  setSelectedMonth("");
                  setSelectedYear("");
                  setFilterOpen(false);
                }}>Clear</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === Table === */}
      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Date</th>
              <th>Time</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t, i) => (
              <tr key={i}>
                <td>{t.name}</td>
                <td>{t.date}</td>
                <td>{t.time}</td>
                <td>{t.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === Search Popup === */}
      {showSearch && (
        <div className="search-popup">
          <div className="search-popup-content">
            <h3>Search Transactions</h3>
            <input
              type="text"
              placeholder="Type transaction name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="search-popup-buttons">
              <button className="apply-btn" onClick={() => setShowSearch(false)}>Apply</button>
              <button className="cancel-btn" onClick={() => setShowSearch(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
