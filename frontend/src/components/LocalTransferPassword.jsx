import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLock, FaCheckCircle } from "react-icons/fa";
import "./LocalTransferPassword.css";
import { useLocalTransfers } from "../context/LocalTransferContext";

export default function LocalTransferPassword() {
  const navigate = useNavigate();
  const { state } = useLocation(); // all fields from Pay step
  const { addLocalBeneficiary, createLocalTransfer } = useLocalTransfers();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [tx, setTx] = useState(null);
  const [working, setWorking] = useState(false);

  // Guard: if no state, send back
  useEffect(() => {
    if (!state) navigate("/app/local-transfer/new", { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Demo password gate
    if (password !== "1234") {
      setError("Incorrect password. Please try again.");
      return;
    }

    setWorking(true);
    try {
      // 1) Save beneficiary (optional)
      if (state.saveBeneficiary) {
        try {
          await addLocalBeneficiary({
            name: state.name,
            bank: state.bank,
            branchCode: state.branchCode,
            accountType: state.accountType,
            accountNumber: state.accountNumber,
          });
        } catch (err) {
          // Ignore duplicate save
          if (!String(err?.message || "").includes("already exists")) {
            throw err;
          }
        }
      }

      // 2) Create transfer
      const result = await createLocalTransfer({
        name: state.name,
        bank: state.bank,
        branchCode: state.branchCode,
        accountType: state.accountType,
        accountNumber: state.accountNumber,
        amount: Number(state.amount),
        ownReference: state.ownReference,
        recipientReference: state.recipientReference,
        paymentType: state.paymentType,
      });

      setTx({
        reference: result.reference,
        date: new Date(result.date || Date.now()).toLocaleString("en-ZA", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      });
      setConfirmed(true);

      // Redirect after a moment
      setTimeout(() => navigate("/app/funds-transfer"), 6000);
    } catch (err) {
      console.error("Local transfer error:", err);
      setError(err?.message || "Payment failed. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  if (confirmed) {
    return (
      <div className="confirmation-page fade-in">
        <div className="confirmation-card">
          <div className="icon-circle success">
            <FaCheckCircle size={32} />
          </div>
          <h2 className="card-title">Payment Successful!</h2>
          <p className="beneficiary-subtext">
            Your transfer to <strong>{state.name}</strong> has been processed successfully.
          </p>

          <hr className="divider" />

          <div className="beneficiary-info">
            <p><strong>Transaction Ref:</strong> {tx?.reference}</p>
            <p><strong>Date:</strong> {tx?.date}</p>
            <p><strong>Bank:</strong> {state.bank}</p>
            <p><strong>Branch Code:</strong> {state.branchCode}</p>
            <p><strong>Account Number:</strong> {state.accountNumber}</p>
            <p><strong>Account Type:</strong> {state.accountType}</p>
            <p><strong>Amount:</strong> R{state.amount}</p>
            <p><strong>Own Reference:</strong> {state.ownReference}</p>
            <p><strong>Recipient Reference:</strong> {state.recipientReference}</p>
            <p><strong>Payment Type:</strong> {state.paymentType}</p>
          </div>

          <hr className="divider" />
          <p className="redirect-text">Redirecting to Fund Transfer…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="local-transfer-password-page fade-in">
      <button className="back-icon" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="local-transfer-password-card">
        <div className="icon-circle"><FaLock /></div>
        <h2 className="card-title">Enter Password</h2>
        <hr className="divider" />

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter your password (try 1234)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            disabled={working}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="submit-btn" disabled={working}>
            {working ? "Processing..." : "Confirm Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
