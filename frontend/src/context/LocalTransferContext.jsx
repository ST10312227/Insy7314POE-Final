// src/context/LocalTransferContext.jsx
import { createContext, useCallback, useContext, useState } from "react";
import { api } from "../lib/api"; // your JWT-aware fetch wrapper

const Ctx = createContext(null);

export function LocalTransferProvider({ children }) {
  const [transfers, setTransfers] = useState([]);   // saved beneficiaries list
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

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
  // Save a local beneficiary
  // shape: { name, bank, branchCode, accountType, accountNumber }
  // ----------------------------
  const saveLocalBeneficiary = useCallback(
    async (bene) => {
      try {
        const saved = await api("/payments/local/beneficiaries", {
          method: "POST",
          json: bene,
        });
        // saved is { id, ...doc }
        // refresh list for consistency
        try { await loadLocalBeneficiaries(); } catch {}
        return saved;
      } catch (err) {
        // If it already exists, backend returns 409; fetch list and match
        if (err.status === 409) {
          const list = await loadLocalBeneficiaries();
          const existing = list.find(
            (b) =>
              String(b.accountNumber) === String(bene.accountNumber) &&
              String(b.bank).toLowerCase() === String(bene.bank).toLowerCase()
          );
          if (existing) return existing;
        }
        throw err;
      }
    },
    [loadLocalBeneficiaries]
  );

  // Utility to normalise an amount input into a JS number
  function toNumberAmount(v) {
    if (typeof v === "number") return v;
    const n = Number(String(v).replace(/[, ]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  // ----------------------------
  // Create a local transfer (payment)
  // payload:
  // {
  //   beneficiary: { name, bank, branchCode, accountType, accountNumber },
  //   amount,
  //   paymentType,
  //   beneficiaryReference,      // maps to ownReference
  //   statementDescription,      // maps to recipientReference
  //   password                   // user's login password
  // }
  // ----------------------------
  const createLocalTransfer = useCallback(
    async (payload) => {
      const {
        beneficiary,
        amount,
        paymentType,
        beneficiaryReference,
        statementDescription,
        password,
      } = payload;

      // 1) Ensure beneficiary exists (or resolve existing on 409)
      const savedBene = await saveLocalBeneficiary(beneficiary);

      // 2) Call transfer endpoint with the flat fields it expects
      const body = {
        name: savedBene.name ?? beneficiary.name,
        bank: savedBene.bank ?? beneficiary.bank,
        branchCode: savedBene.branchCode ?? beneficiary.branchCode,
        accountType: savedBene.accountType ?? beneficiary.accountType,
        accountNumber: savedBene.accountNumber ?? beneficiary.accountNumber,

        amount: toNumberAmount(amount),
        ownReference: beneficiaryReference,
        recipientReference: statementDescription,
        paymentType,
        password, // required by backend to validate user
      };

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
  if (!ctx) throw new Error("useLocalTransfers must be used within LocalTransferProvider");
  return ctx;
}
