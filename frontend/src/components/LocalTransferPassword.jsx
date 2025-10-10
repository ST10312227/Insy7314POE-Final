// src/components/LocalTransferPassword.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import "./LocalTransferPassword.css";
import { useLocalTransfers } from "../context/LocalTransferContext";

const ACCOUNT_TYPE_MAP = {
  cheque: "Cheque",
  Cheque: "Cheque",
  savings: "Savings",
  Savings: "Savings",
  transmission: "Credit",   // map UI "Transmission" -> backend "Credit"
  Transmission: "Credit",
  credit: "Credit",
  Credit: "Credit",
};

const PAYMENT_TYPE_MAP = {
  eft: "EFT",
  EFT: "EFT",
  "real-time": "RTC",
  realtime: "RTC",
  "real time": "RTC",
  rtc: "RTC",
  RTC: "RTC",
  "Real-time": "RTC",
  "Real Time": "RTC",
};

export default function LocalTransferPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { createLocalTransfer } = useLocalTransfers();

  if (!state) {
    navigate("/app/local-transfer", { replace: true });
    return null;
  }

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

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

  function buildPayload() {
    const name = (recap.name ?? "").toString().trim();
    const bank =
      (typeof state.bank === "string"
        ? state.bank
        : state.bank?.code ?? state.bank?.name ?? recap.bank
      )
        .toString()
        .trim();

    const branchCode = (recap.branchCode ?? "")
      .toString()
      .replace(/\D/g, "")
      .slice(0, 6);

    const accountNumber = (recap.accountNumber ?? "")
      .toString()
      .replace(/\s/g, "");

    const accountType =
      ACCOUNT_TYPE_MAP[(recap.accountType ?? "").toString()] ??
      (recap.accountType ?? "").toString();

    const paymentType =
      PAYMENT_TYPE_MAP[(recap.paymentType ?? "").toString()] ??
      (recap.paymentType ?? "").toString();

    const amount = Number(String(recap.amount).replace(/[, ]/g, ""));

    const beneficiaryReference = (recap.beneficiaryReference ?? "")
      .toString()
      .trim()
      .slice(0, 30);

    const statementDescription = (recap.statementDescription ?? "")
      .toString()
      .trim()
      .slice(0, 30);

    // FLAT payload (no 'beneficiary' object) — matches context/createLocalTransfer
    return {
      name,
      bank,
      branchCode,
      accountType,          // "Savings" | "Cheque" | "Credit"
      accountNumber,
      amount,               // number (switch to amountCents in context if needed)
      paymentType,          // "EFT" | "RTC"
      beneficiaryReference,
      statementDescription,
      password,
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);

    try {
      const payload = buildPayload();
      const transfer = await createLocalTransfer(payload);
      navigate(`/app/local-transfer/details/${transfer?.id || ""}`, {
        state: transfer,
        replace: true,
      });
    } catch (e2) {
      const data = e2?.response?.data;
      const msg =
        data?.issues?.[0]?.message ||
        data?.message ||
        e2?.message ||
        "Could not complete transfer.";
      console.error("Local transfer error:", data || e2);
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="local-transfer-password-page">
      <div className="local-transfer-password-card">
        <h2>Confirm Transfer</h2>

        <div className="lt-recap">
          <div>
            <strong>To:</strong> {recap.name} ({recap.bank})
          </div>
          <div>
            <strong>Account:</strong> {recap.accountNumber}
          </div>
          <div>
            <strong>Amount:</strong> {recap.amount}
          </div>
          <div>
            <strong>Type:</strong> {recap.paymentType}
          </div>
          {recap.beneficiaryReference && (
            <div>
              <strong>Beneficiary Ref:</strong> {recap.beneficiaryReference}
            </div>
          )}
          {recap.statementDescription && (
            <div>
              <strong>Statement Desc:</strong> {recap.statementDescription}
            </div>
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
