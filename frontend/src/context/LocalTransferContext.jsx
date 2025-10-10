import { createContext, useContext, useCallback, useMemo, useState } from "react";

const LocalTransferCtx = createContext(null);

export function LocalTransferProvider({ children }) {
  const [transfers, setTransfers] = useState([]); // array of {name, bank, branchCode, accountType, accountNumber,...}

  const authHeader = useMemo(() => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  }, []);

  // GET /payments/local/beneficiaries
  const loadLocalBeneficiaries = useCallback(async () => {
    const res = await fetch("/api/payments/local/beneficiaries", {
      headers: { "Content-Type": "application/json", ...authHeader },
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to load beneficiaries (${res.status})`);
    const data = await res.json();
    // normalize to the shape your UI expects
    const items = Array.isArray(data.items) ? data.items : [];
    setTransfers(items.map(x => ({
      id: x._id || x.id,
      name: x.name,
      bank: x.bank,
      branchCode: x.branchCode,
      accountType: x.accountType,
      accountNumber: x.accountNumber,
      createdAt: x.createdAt,
    })));
  }, [authHeader]);

  // POST /payments/local/beneficiaries
  const addLocalBeneficiary = useCallback(async (payload) => {
    const res = await fetch("/api/payments/local/beneficiaries", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code = data?.error || `create_failed_${res.status}`;
      throw new Error(code === "beneficiary_exists" ? "Beneficiary already exists." : "Could not create beneficiary.");
    }
    // optimistic update
    setTransfers(prev => [{ ...payload, id: data.id, createdAt: data.createdAt || new Date().toISOString() }, ...prev]);
    return data;
  }, [authHeader]);

  const value = useMemo(() => ({
    transfers,
    loadLocalBeneficiaries,
    addLocalBeneficiary,
  }), [transfers, loadLocalBeneficiaries, addLocalBeneficiary]);

  return <LocalTransferCtx.Provider value={value}>{children}</LocalTransferCtx.Provider>;
}

export function useLocalTransfers() {
  const ctx = useContext(LocalTransferCtx);
  if (!ctx) throw new Error("useLocalTransfers must be used within LocalTransferProvider");
  return ctx;
}
