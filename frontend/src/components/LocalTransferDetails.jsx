import { useParams, useNavigate } from "react-router-dom";
import { useLocalTransfers } from "../context/LocalTransferContext";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import "./LocalTransferDetails.css";

function LocalTransferDetails() {
  const { id } = useParams();
  const { transfers } = useLocalTransfers();
  const navigate = useNavigate();

  const beneficiary = transfers[id];

  if (!beneficiary) {
    return <p>Beneficiary not found</p>;
  }

  return (
    <div className="add-beneficiary-page">
      <button className="back-icon" onClick={() => navigate("/local-transfer")}>
        <FaArrowLeft />
      </button>

      <div className="add-beneficiary-card">
        <div className="icon-circle">
          <FaUser />
        </div>

        <h2 className="card-title">{beneficiary.name}</h2>
        <p>{beneficiary.bank}</p>
        <p>{beneficiary.accountNumber}</p>

        <hr className="divider" />

        <div className="beneficiary-info">
          <p><strong>Bank:</strong> {beneficiary.bank}</p>
          <p><strong>Branch Code:</strong> {beneficiary.branchCode}</p>
          <p><strong>Account Type:</strong> {beneficiary.accountType}</p>
          <p><strong>Account Number:</strong> {beneficiary.accountNumber}</p>
        </div>

        <button
          className="add-btn"
          onClick={() =>
            navigate(`/local-transfer/pay/${id}`, {
              state: { beneficiary },
            })
          }
        >
          Make Payment
        </button>
      </div>
    </div>
  );
}

export default LocalTransferDetails;
