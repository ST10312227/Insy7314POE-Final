import { createContext, useContext, useEffect, useState, useCallback } from "react";

const InternationalCtx = createContext(null);

export function InternationalProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const handleAuthFailure = async (res) => {
    // Try to read server error
    let msg = "Unauthorized";
    try {
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { error: await res.text() };
      msg = data?.error || msg;
    } catch {}
    // Helpful console
    console.warn("Auth error:", msg, "(status:", res.status, ")");
    // If we truly have no token, send to login
    if (!localStorage.getItem("token")) {
      window.location.assign("/login");
      return;
    }
    throw new Error(msg);
  };

  const fetchBeneficiaries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/international/beneficiaries", {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
      });
      if (res.status === 401 || res.status === 400) return handleAuthFailure(res);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || "Failed to load international beneficiaries.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addBeneficiary = useCallback(async (payload) => {
    const res = await fetch("/api/payments/international/beneficiaries", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (res.status === 401 || res.status === 400) return handleAuthFailure(res);
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : { error: await res.text() };
    if (!res.ok) {
      // Show Zod/validation messages if present
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    setItems((s) => [data, ...s]);
    return data;
  }, []);

  const createTransfer = useCallback(async ({ beneficiaryId, amount, currency, reference }) => {
    const res = await fetch("/api/payments/international/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify({ beneficiaryId, amount: Number(amount), currency, reference }),
    });
    if (res.status === 401 || res.status === 400) return handleAuthFailure(res);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Transfer failed");
    return data;
  }, []);

  useEffect(() => { fetchBeneficiaries(); }, [fetchBeneficiaries]);

  return (
    <InternationalCtx.Provider value={{
      items, loading, error, fetchBeneficiaries, addBeneficiary, createTransfer
    }}>
      {children}
    </InternationalCtx.Provider>
  );
}

export const useInternational = () => useContext(InternationalCtx);
