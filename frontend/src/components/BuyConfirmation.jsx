import { useLocation, useNavigate } from "react-router-dom";
import "./BuyConfirmation.css";
import { FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { useEffect, useState } from "react";

import vodacomLogo from "../assets/vodacom_logo.png";
import mtnLogo from "../assets/mtn_logo.png";
import cellcLogo from "../assets/cellc_logo.png";
import telkomLogo from "../assets/telkom_logo.png";

function BuyConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { bundle, type, network } = state || {};

  const [countdown, setCountdown] = useState(5);

  const logos = {
    vodacom: vodacomLogo,
    mtn: mtnLogo,
    cellc: cellcLogo,
    telkom: telkomLogo,
    "telkom mobile": telkomLogo,
  };

  const logoSrc = logos[network?.toLowerCase()] || null;

  // Countdown + Auto-redirect
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/bill-payments");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="confirmation-page fade-in">
      <button className="back-icon" onClick={() => navigate("/bill-payments")}>
        <FaArrowLeft />
      </button>

      <div className="confirmation-card">
        <div className="icon-circle success">
          <FaCheckCircle />
        </div>

        {logoSrc && (
          <img src={logoSrc} alt={`${network} logo`} className="network-logo" />
        )}

        <h2 className="card-title">Purchase Successful</h2>

        <p className="beneficiary-subtext">You’ve successfully purchased:</p>
        <p className="beneficiary-subtext">
          <strong>{bundle?.desc}</strong> for <strong>{bundle?.price}</strong>
        </p>
        <p className="beneficiary-subtext">
          Network: <strong>{network}</strong>
        </p>
        <p className="beneficiary-subtext">
          Type: <strong>{type?.toUpperCase()}</strong>
        </p>

        <hr className="divider" />

        <p className="redirect-text">
          Redirecting to Bill Payments in{" "}
          <strong style={{ color: "#1c2a8a" }}>{countdown}</strong>...
        </p>

        <button
          className="add-btn"
          onClick={() => navigate("/bill-payments")}
        >
          Back to Bill Payments
        </button>
      </div>
    </div>
  );
}

export default BuyConfirmation;
