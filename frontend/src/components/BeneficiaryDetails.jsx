import { useParams, useNavigate } from "react-router-dom";
import { useBeneficiaries } from "../context/BeneficiaryContext";
import "./BeneficiaryDetails.css";
import { FaArrowLeft, FaPhone } from "react-icons/fa";

function BeneficiaryDetails() {
  const { id } = useParams();
  const { beneficiaries } = useBeneficiaries();
  const navigate = useNavigate();

  const beneficiary = beneficiaries[id];

  if (!beneficiary) {
    return (
      <div className="add-beneficiary-page">
        <button className="back-icon" onClick={() => navigate("/buy-airtime")}>
          <FaArrowLeft />
        </button>
        <div className="add-beneficiary-card">
          <h2 className="card-title">Beneficiary not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="add-beneficiary-page">
      <button className="back-icon" onClick={() => navigate("/buy-airtime")}>
        <FaArrowLeft />
      </button>

      <div className="add-beneficiary-card">
        <div className="icon-circle">
          <FaPhone />
        </div>

        <h2 className="card-title">{beneficiary.name}</h2>
        <p className="beneficiary-subtext">{beneficiary.network}</p>
        <p className="beneficiary-subtext">{beneficiary.number}</p>

        <hr className="divider" />

        <div className="beneficiary-info">
          <p>
            <strong>Network:</strong> {beneficiary.network}
          </p>
          <p>
            <strong>Phone:</strong> {beneficiary.number}
          </p>
        </div>

        {/* Navigate to BuyBundleOptions page */}
        <button
          className="add-btn"
          onClick={() =>
            navigate(`/buy-airtime/${id}/options`, {
              state: {
                network: beneficiary.network,
                number: beneficiary.number,
                name: beneficiary.name,
              },
            })
          }
        >
          Buy Airtime
        </button>
      </div>
    </div>
  );
}

export default BeneficiaryDetails;
