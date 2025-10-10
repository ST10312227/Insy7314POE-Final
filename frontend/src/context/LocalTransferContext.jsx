// src/context/LocalTransferContext.jsx
import { createContext, useCallback, useContext, useState } from "react";
import { api } from "../lib/api";

const Ctx = createContext(null);

// ---------- ENUM NORMALIZERS (match backend EXACTLY) ----------
const ACCOUNT_TYPE_MAP = {
  cheque: "Cheque",
  Cheque: "Cheque",
  savings: "Savings",
  Savings: "Savings",
  transmission: "Credit", // UI "Transmission" -> backend "Credit"
  Transmission: "Credit",
  credit: "Credit",
  Credit: "Credit",
};

const PAYMENT_TYPE_MAP = {
  eft: "EFT",
  EFT: "EFT",
  "real-time": "Real-time",
  realtime: "Real-time",
  "real time": "Real-time",
  rtc: "Real-time",
  RTC: "Real-time",
  "Real-time": "Real-time",
  "Real Time": "Real-time",
};

// ---------- HELPERS ----------
function toNumberAmount(v) {
  if (typeof v === "number") return v;
  const n = Number(String(v ?? "").replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function normalizeBeneficiary(b = {}) {
  const bank =
    (typeof b.bank === "string" ? b.bank : b.bank?.code ?? b.bank?.name ?? "")
      .toString()
      .trim();

  return {
    name: (b.name ?? b.holderName ?? "").toString().trim(),
    bank,
    branchCode: (b.branchCode ?? "").toString().replace(/\D/g, "").slice(0, 6),
    accountType:
      ACCOUNT_TYPE_MAP[(b.accountType ?? "").toString()] ??
      (b.accountType ?? "").toString(),
    accountNumber: (b.accountNumber ?? "").toString().replace(/\s/g, ""),
  };
}

export function LocalTransferProvider({ children }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load saved local beneficiaries
  const loadLocalBeneficiaries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { items = [] } = await api("/api/payments/local/beneficiaries");
      setTransfers(items);
      return items;
    } catch (err) {
      setError(err.message || "Failed to load beneficiaries");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save a local beneficiary (FLAT, NORMALIZED)
  const saveLocalBeneficiary = useCallback(
    async (bene) => {
      const flat = normalizeBeneficiary(bene);
      try {
        const saved = await api("/api/payments/local/beneficiaries", {
          method: "POST",
          json: flat,
        });
        try { await loadLocalBeneficiaries(); } catch {}
        return saved;
      } catch (err) {
        if (err.status === 409) {
          const list = await loadLocalBeneficiaries();
          const existing = list.find(
            (b) =>
              String(b.accountNumber) === String(flat.accountNumber) &&
              String(b.bank).toLowerCase() === String(flat.bank).toLowerCase()
          );
          if (existing) return existing;
        }
        throw err;
      }
    },
    [loadLocalBeneficiaries]
  );

  // Create a local transfer (payment) — accepts a FLAT payload
  const createLocalTransfer = useCallback(
    async (payload) => {
      // Build/normalize beneficiary from flat payload
      const beneFlat = normalizeBeneficiary(payload);

      // 1) Ensure beneficiary exists (or resolve existing on 409)
      const savedBene = await saveLocalBeneficiary(beneFlat);

      // 2) Build exact body expected by /transfers
      const ownRefRaw = (payload.beneficiaryReference ?? "").toString().trim();
      const recipRefRaw = (payload.statementDescription ?? "").toString().trim();

      const body = {
        name: savedBene.name ?? beneFlat.name,
        bank: savedBene.bank ?? beneFlat.bank,
        branchCode: savedBene.branchCode ?? beneFlat.branchCode,
        accountType: savedBene.accountType ?? beneFlat.accountType,
        accountNumber: savedBene.accountNumber ?? beneFlat.accountNumber,

        amount: toNumberAmount(payload.amount), // switch to cents if your API wants amountCents
        paymentType:
          PAYMENT_TYPE_MAP[(payload.paymentType ?? "").toString()] ??
          (payload.paymentType ?? "").toString(),

        // ensure >= 1 char (backend requires non-empty)
        ownReference: (ownRefRaw || (beneFlat.name || "Local transfer")).slice(0, 30),
        recipientReference: (recipRefRaw || "Local transfer").slice(0, 30),

        password: payload.password || "",
      };

      // console.log("[createLocalTransfer] POST /transfers", body);

      const { transfer } = await api("/api/payments/local/transfers", {
        method: "POST",
        json: body,
      });

      return transfer;
    },
    [saveLocalBeneficiary]
  );

  const value = {
    transfers,
    loading,
    error,
    loadLocalBeneficiaries,
    saveLocalBeneficiary,
    createLocalTransfer,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocalTransfers() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useLocalTransfers must be used within LocalTransferProvider"
    );
  return ctx;
}
