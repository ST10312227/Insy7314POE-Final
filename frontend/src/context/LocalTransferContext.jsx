// src/context/LocalTransferContext.jsx
import { createContext, useCallback, useContext, useState } from "react";
import { api } from "../lib/api"; // JWT-aware fetch wrapper: api(path, { method, json })

const Ctx = createContext(null);

// --- Enum normalizers (match backend EXACTLY) ---
const ACCOUNT_TYPE_MAP = {
  cheque: "Cheque",
  Cheque: "Cheque",
  savings: "Savings",
  Savings: "Savings",
  transmission: "Credit",   // UI sometimes says "Transmission" -> backend wants "Credit"
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

// --- Helpers ---
function toNumberAmount(v) {
  if (typeof v === "number") return v;
  const n = Number(String(v ?? "").replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function normalizeBeneficiary(b) {
  const bank =
    (typeof b.bank === "string" ? b.bank : b.bank?.code ?? b.bank?.name ?? "")
      .toString()
      .trim();

  return {
    name: (b.name ?? b.holderName ?? "").toString().trim(),
    bank, // string
    branchCode: (b.branchCode ?? "")
      .toString()
      .replace(/\D/g, "")
      .slice(0, 6),
    accountType:
      ACCOUNT_TYPE_MAP[(b.accountType ?? "").toString()] ??
      (b.accountType ?? "").toString(),
    accountNumber: (b.accountNumber ?? "").toString().replace(/\s/g, ""),
  };
}

export function LocalTransferProvider({ children }) {
  const [transfers, setTransfers] = useState([]); // saved beneficiaries list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------
  // Load saved local beneficiaries
  // ----------------------------
  const loadLocalBeneficiaries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { items = [] } = await api("/payments/local/beneficiaries");
      setTransfers(items);
      return items;
    } catch (err) {
      setError(err.message || "Failed to load beneficiaries");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------
  // Save a local beneficiary (flat, normalized)
  // shape in DB: { name, bank, branchCode, accountType, accountNumber }
  // ----------------------------
  const saveLocalBeneficiary = useCallback(
    async (bene) => {
      const flat = normalizeBeneficiary(bene);

      try {
        const saved = await api("/payments/local/beneficiaries", {
          method: "POST",
          json: flat,
        });
        try {
          await loadLocalBeneficiaries();
        } catch {}
        return saved;
      } catch (err) {
        // If it already exists, backend returns 409; fetch and match
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

  // ----------------------------
  // Create a local transfer (payment)
  // Accepts a FLAT payload (NO nested beneficiary)
  // {
  //   name, bank, branchCode, accountType, accountNumber,
  //   amount, paymentType, beneficiaryReference, statementDescription, password
  // }
  // ----------------------------
  const createLocalTransfer = useCallback(
    async (payload) => {
      // 1) Ensure beneficiary exists (or resolve existing on 409)
      const beneFlat = normalizeBeneficiary(payload);
      const savedBene = await saveLocalBeneficiary(beneFlat);

      // 2) Build the exact body your /transfers endpoint expects
      const body = {
        name: savedBene.name ?? beneFlat.name,
        bank: savedBene.bank ?? beneFlat.bank,
        branchCode: savedBene.branchCode ?? beneFlat.branchCode,
        accountType: savedBene.accountType ?? beneFlat.accountType,
        accountNumber: savedBene.accountNumber ?? beneFlat.accountNumber,

        amount: toNumberAmount(payload.amount), // or send amountCents if your API wants cents
        paymentType:
          PAYMENT_TYPE_MAP[(payload.paymentType ?? "").toString()] ??
          (payload.paymentType ?? "").toString(),
        ownReference: (payload.beneficiaryReference ?? "").toString().trim(),
        recipientReference: (payload.statementDescription ?? "")
          .toString()
          .trim(),
        password: payload.password || "",
      };

      // Debug once while testing:
      // console.log("[createLocalTransfer] POST /transfers", body);

      const { transfer } = await api("/payments/local/transfers", {
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
