import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import "./BeneficiaryConfirmation.css";

function BeneficiaryConfirmation() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      navigate("/buy-airtime");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="confirmation-page fade-in">
      <button className="back-icon" onClick={() => navigate("/buy-airtime")}>
        <FaArrowLeft />
      </button>

      <div className="confirmation-card">
        <div className="icon-circle success blue-glow">
          <FaCheckCircle />
        </div>

        <h2 className="card-title">Beneficiary Added</h2>
        <p className="beneficiary-subtext">
          Your new beneficiary has been successfully saved.
        </p>

        <hr className="divider" />

        <p className="redirect-text">
          Redirecting to <strong>Buy Airtime</strong> in{" "}
          <strong style={{ color: "#1c2a8a" }}>{countdown}</strong>...
        </p>

        <button
          className="add-btn"
          onClick={() => navigate("/buy-airtime")}
        >
          Back to Buy Airtime
        </button>
      </div>
    </div>
  );
}

export default BeneficiaryConfirmation;
