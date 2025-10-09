import { useParams, useNavigate } from "react-router-dom";
import { useBeneficiaries } from "../context/BeneficiaryContext";
import { bundles } from "../data/bundles";
import "./BuyBundleOptions.css";
import { FaArrowLeft, FaPhone } from "react-icons/fa";
import { useState } from "react";

function BuyBundleOptions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { beneficiaries } = useBeneficiaries();
  const beneficiary = beneficiaries[id];
  const [bundleType, setBundleType] = useState("airtime");

  if (!beneficiary) return <div>Beneficiary not found</div>;

  const networkKey = beneficiary.network.toLowerCase().replace(/\s+/g, "");
  const networkBundles = bundles[networkKey];
  const selectedBundles = networkBundles[bundleType] || [];

  const handleSelect = (bundle) => {
    navigate(`/buy-airtime/${id}/confirmation`, {
      state: { bundle, type: bundleType, network: beneficiary.network },
    });
  };

  return (
    <div className="buy-airtime-page fade-in">
      <button className="back-icon" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="buy-airtime-card fade-in">
        <div className="icon-circle">
          <FaPhone />
        </div>

        <h2 className="card-title">
          {beneficiary.network}{" "}
          {bundleType.charAt(0).toUpperCase() + bundleType.slice(1)} Bundles
        </h2>
        <p className="beneficiary-subtext">{beneficiary.number}</p>

        <select
          className="vault-select"
          value={bundleType}
          onChange={(e) => setBundleType(e.target.value)}
        >
          {Object.keys(networkBundles).map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <hr className="divider" />

        <div className="bundle-list">
          {selectedBundles.map((bundle, index) => (
            <div
              key={index}
              className="bundle-item"
              onClick={() => handleSelect(bundle)}
            >
              <strong>{bundle.price}</strong>
              <p>{bundle.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BuyBundleOptions;
