import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBeneficiaries } from "../context/BeneficiaryContext";
import "./BuyAirtimeOptions.css";
import { FaPhone, FaArrowLeft } from "react-icons/fa";

function BuyAirtimeOptions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { beneficiaries } = useBeneficiaries();
  const beneficiary = beneficiaries[id];
  const [productType, setProductType] = useState("");

  const handleNext = () => {
    if (!productType) return alert("Please choose a product type");
    navigate(`/buy-airtime/${id}/bundles/${productType}`);
  };

  if (!beneficiary) return <div>Beneficiary not found</div>;

  return (
    <div className="add-beneficiary-page">
      <button className="back-icon" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="add-beneficiary-card">
        <div className="icon-circle"><FaPhone /></div>
        <h2 className="card-title">{beneficiary.name}</h2>
        <p className="beneficiary-subtext">{beneficiary.network}</p>
        <p className="beneficiary-subtext">{beneficiary.number}</p>

        <hr className="divider" />

        <div className="account-box">
          <div>
            <strong>Main Account</strong><br />
            <small>Available Balance</small>
          </div>
          <div className="account-balance">R15 000.00</div>
        </div>

        <select
          className="vault-select"
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
        >
          <option value="">Choose Product Type</option>
          <option value="airtime">Airtime</option>
          <option value="data">Data Bundle</option>
          <option value="sms">SMS Bundle</option>
        </select>

        <button className="add-btn" onClick={handleNext}>Buy</button>
      </div>
    </div>
  );
}

export default BuyAirtimeOptions;
