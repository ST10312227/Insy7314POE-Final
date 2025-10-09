import React from "react";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">the<br/>vault</h2>
      <div className="menu">
        <p>🔍 Search</p>
        <p>💸 Fund Transfer</p>
        <p>📜 Transaction History</p>
        <div className="bottom-links">
          <p>🔔 Notifications</p>
          <p>🔓 Logout</p>
          <p>❔ Help</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

