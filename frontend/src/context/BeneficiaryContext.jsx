import { createContext, useContext, useEffect, useState, useCallback } from "react";

const BeneficiaryCtx = createContext(null);

export function BeneficiaryProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const safeParse = async (res) => {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return await res.json();
    return { error: (await res.text())?.slice(0, 200) };
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/beneficiaries", {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const data = await safeParse(res);
      if (!res.ok) throw new Error(data?.error || `fetch_failed_${res.status}`);
      setItems(data?.items || []);
    } catch (e) {
      console.error("Fetch beneficiaries failed:", e);
      setError(
        e.message.includes("404")
          ? "Endpoint not found. Is /payments/beneficiaries mounted on the backend?"
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addBeneficiary = async ({ name, number, network }) => {
    const res = await fetch("/api/payments/beneficiaries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({ name: name.trim(), number: number.trim(), network }),
    });
    const data = await safeParse(res);
    if (!res.ok) {
      const map = {
        beneficiary_exists: "This number is already saved for your profile.",
        create_failed: "Could not save beneficiary. Try again.",
      };
      throw new Error(map[data?.error] || data?.error || `Create failed (${res.status})`);
    }
    setItems((prev) => [{ ...data }, ...prev]);
    return data;
  };

  return (
    <BeneficiaryCtx.Provider
      value={{ beneficiaries: items, loading, error, fetchAll, addBeneficiary }}
    >
      {children}
    </BeneficiaryCtx.Provider>
  );
}

export const useBeneficiaries = () => useContext(BeneficiaryCtx);
