// components/FundsTransfer.jsx
import { useNavigate } from "react-router-dom";
import "./FundsTransfer.css";

export default function FundsTransfer() {
  const navigate = useNavigate();

  return (
    <div className="fund-transfer-container">
      <h2 className="fund-title">
        Fund <span>Transfer</span>
      </h2>
      <p className="fund-subtitle">
        Easily transfer funds between accounts, whether local, international, or within the same bank.
      </p>

      <div className="fund-card-wrapper">
        <div
          className="fund-card white-card"
          onClick={() => navigate("/app/local-transfer")}
          role="button"
          tabIndex={0}
        >
          <i className="fa-solid fa-user-group"></i>
          <h3>Local Transfer</h3>
        </div>

        <div
          className="fund-card blue-card"
          onClick={() => navigate("/app/international")}
          role="button"
          tabIndex={0}
        >
          <i className="fa-solid fa-globe"></i>
          <h3>International Transfer</h3>
        </div>

        <div
          className="fund-card white-card"
          onClick={() => navigate("/app/funds-transfer")}
          role="button"
          tabIndex={0}
        >
          <i className="fa-solid fa-landmark"></i>
          <h3>Same Bank Transfer</h3>
        </div>
      </div>
    </div>
  );
}
