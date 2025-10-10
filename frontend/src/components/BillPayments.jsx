// components/BillPayments.jsx
import { useNavigate } from "react-router-dom";
import "./BillPayments.css";

function BillPayments() {
  const navigate = useNavigate();

  return (
    <div className="bill-payments-container">
      <h2 className="bill-title">
        Bill <span>Payments</span>
      </h2>
      <p className="bill-subtitle">
        Easily pay your utility bills, airtime, and subscriptions in one place.
      </p>

      <div className="bill-card-wrapper">
        <div
          className="bill-card white-card"
          onClick={() => navigate("/app/buy-airtime")}
        >
          <i className="fa-solid fa-phone"></i>
          <h3>Buy Airtime</h3>
        </div>

        {/* ✅ wire to recurring */}
        <div
          className="bill-card blue-card"
          onClick={() => navigate("/app/recurring/options")}
        >
          <i className="fa-solid fa-hand-holding-dollar"></i>
          <h3>Recurring Payments</h3>
        </div>

        <div className="bill-card white-card">
          <i className="fa-solid fa-bolt"></i>
          <h3>Buy Electricity</h3>
        </div>
      </div>
    </div>
  );
}

export default BillPayments;
