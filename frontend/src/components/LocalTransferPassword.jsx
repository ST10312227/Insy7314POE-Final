// src/components/LocalTransferPassword.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import "./LocalTransferPassword.css";
import { useLocalTransfers } from "../context/LocalTransferContext";

export default function LocalTransferPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { createLocalTransfer } = useLocalTransfers();

  // state should contain:
  // {
  //   bank, branchCode, accountType, name, accountNumber,
  //   amount, paymentType, beneficiaryReference, statementDescription
  // }
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // If someone hits this screen directly, return them to the start of the flow.
  if (!state) {
    navigate("/app/local-transfer", { replace: true });
    return null;
  }

  const recap = useMemo(
    () => ({
      bank: state.bank || "",
      branchCode: state.branchCode || "",
      accountType: state.accountType || "",
      name: state.name || "",
      accountNumber: state.accountNumber || "",
      amount: state.amount || "",
      paymentType: state.paymentType || "Real-time",
      beneficiaryReference: state.beneficiaryReference || "",
      statementDescription: state.statementDescription || "",
    }),
    [state]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);

    try {
      // IMPORTANT: pass the user's login password for backend verification
      const transfer = await createLocalTransfer({
        beneficiary: {
          bank: recap.bank,
          branchCode: recap.branchCode,
          accountType: recap.accountType,
          name: recap.name,
          accountNumber: recap.accountNumber,
        },
        amount: recap.amount,
        paymentType: recap.paymentType,
        beneficiaryReference: recap.beneficiaryReference,
        statementDescription: recap.statementDescription,
        password, // user's login password
      });

      // Go to receipt/details (keep server payload in route state too)
      navigate(`/app/local-transfer/details/${transfer?.id || ""}`, {
        state: transfer,
        replace: true,
      });
    } catch (e2) {
      console.error("Local transfer error:", e2);
      setErr(
        e2?.message || e2?.data?.error || "Could not complete transfer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="local-transfer-password-page">
      <div className="local-transfer-password-card">
        <h2>Confirm Transfer</h2>

        {/* Quick recap */}
        <div className="lt-recap">
          <div><strong>To:</strong> {recap.name} ({recap.bank})</div>
          <div><strong>Account:</strong> {recap.accountNumber}</div>
          <div><strong>Amount:</strong> {recap.amount}</div>
          <div><strong>Type:</strong> {recap.paymentType}</div>
          {recap.beneficiaryReference && (
            <div><strong>Beneficiary Ref:</strong> {recap.beneficiaryReference}</div>
          )}
          {recap.statementDescription && (
            <div><strong>Statement Desc:</strong> {recap.statementDescription}</div>
          )}
        </div>

        {err && <div className="lt-error">{err}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="vault-password">Vault Password</label>
          <input
            id="vault-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your login password"
            autoComplete="current-password"
            required
          />

          <button className="submit-btn" type="submit" disabled={submitting}>
            {submitting ? "Processing…" : "Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}
