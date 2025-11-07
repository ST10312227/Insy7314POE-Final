// src/components/EmployeeDashboardLayout.jsx
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import "./DashboardLayout.css"; // reuse same styles

function EmployeeDashboardLayout() {
  return (
    <div className="dashboard-layout">
      <EmployeeSidebar />
      <div className="dashboard-main">
        <EmployeeTopbar />
        <div className="dashboard-content">
          <Outlet /> {/* Renders active employee page (e.g., PendingTransactions) */}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboardLayout;
