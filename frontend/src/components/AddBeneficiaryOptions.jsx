import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaUserFriends } from "react-icons/fa";
import "./AddBeneficiaryOptions.css";

function AddBeneficiaryOptions() {
  const navigate = useNavigate();
  const { state } = useLocation(); // ✅ get beneficiary info from previous page

  const beneficiary = state || {};

  const [formData, setFormData] = useState({
    amount: "",
    ownReference: "",
    recipientReference: "",
    paymentType: "Real-time",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Merge all data (beneficiary + form)
    const completeData = { ...beneficiary, ...formData };

    // ✅ Navigate to password screen with all data
    navigate("/local-transfer/password", { state: completeData });
  };

  return (
    <div className="local-transfer-page fade-in">
      <button className="back-icon" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="local-transfer-card">
        <div className="icon-circle">
          <FaUserFriends />
        </div>

        <h2 className="card-title">Add Payment</h2>
        <hr className="divider" />

        <div className="account-box">
          <div>
            <strong>Vault Cellphone</strong>
            <br />
            <small>Pay to a Vault client's cellphone number</small>
          </div>
        
        </div>
          <div className="account-box">
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
