// src/context/AccountContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const AccountCtx = createContext(null);

function normalizeProfile(res) {
  // Support shapes: { data: { user } }, { user }, { profile }, raw user object
  const data = res?.data ?? res ?? null;
  return data?.user ?? data?.profile ?? data ?? null;
}

export function AccountProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const hasToken = () => Boolean(localStorage.getItem("token"));

  const loadProfile = useCallback(async () => {
    if (!hasToken()) {
      setProfile(null);
      setLoading(false);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // NOTE: your api wrapper likely prefixes /api; keep your path as-is
      const res = await api("/accounts/me");
      const user = normalizeProfile(res);
      setProfile(user);
      if (!user) setError("Unable to load profile."); // defensive
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if (status === 401) {
        // Token invalid/expired
        localStorage.removeItem("token");
        setProfile(null);
        // Let your route guards handle redirect; if you prefer, uncomment:
        // navigate("/login", { replace: true });
      } else {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load profile";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Update partial fields and refresh local state
  const updateMe = useCallback(async (patch) => {
    const res = await api("/accounts/me", {
      method: "PUT",
      body: patch,
      headers: { "Content-Type": "application/json" },
    });
    const user = normalizeProfile(res);
    setProfile(user);
    return user;
  }, []);

  // Keep context in sync when token changes (e.g., login/logout in another tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") loadProfile();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      profile,
      loading,
      error,
      isAuthenticated: Boolean(profile) && hasToken(),
      refresh: loadProfile,
      updateMe,
      logout: () => {
        localStorage.removeItem("token");
        setProfile(null);
        // navigate("/login", { replace: true }); // optional explicit redirect
      },
    }),
    [profile, loading, error, loadProfile, updateMe]
  );

  return <AccountCtx.Provider value={value}>{children}</AccountCtx.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountCtx);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
