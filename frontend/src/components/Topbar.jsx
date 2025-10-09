import React from "react";
import "./Topbar.css";

function Topbar() {
  return (
    <div className="topbar">
      <div className="nav-links">
        <span>Dashboard</span>
        <span className="active">Bill Payments</span>
        <span>Account Details</span>
      </div>
      <div className="user">Hello, John Doe!</div>
    </div>
  );
}

export default Topbar;

