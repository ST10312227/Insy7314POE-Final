// components/AddBeneficiaryOptions.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaUserFriends } from "react-icons/fa";
import "./AddBeneficiaryOptions.css";

function AddBeneficiaryOptions() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const beneficiary = state || {};

  return (
    <div className="local-transfer-page fade-in">
      <button className="back-icon" onClick={() => navigate("/app/bill-payments")}>
        <FaArrowLeft />
      </button>

      <div className="local-transfer-card">
        <div className="icon-circle">
          <FaUserFriends />
        </div>

        <h2 className="card-title">Add Payment</h2>
        <hr className="divider" />

        {/* Make each option clickable */}
        <div
          className="account-box option"
          onClick={() => navigate("/app/recurring/add-payment", {
            state: { ...beneficiary, type: "vault-cellphone" }
          })}
          role="button"
          tabIndex={0}
        >
          <div>
            <strong>Vault Cellphone</strong>
            <br />
            <small>Pay to a Vault client's cellphone number</small>
          </div>
        </div>

        <div
          className="account-box option"
          onClick={() => navigate("/app/recurring/add-beneficiary")}
          role="button"
          tabIndex={0}
        >
          <div>
            <strong>Bank Account</strong>
            <br />
            <small>Enter Beneficiary's banking details</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBeneficiaryOptions;
