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
    const token = localStorage.getItem("token");
    if (!token) {           // do nothing on public pages
      setProfile(null);
      setLoading(false);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { profile } = await api("/accounts/me");
      setProfile(profile);
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem("token");
        setProfile(null);
        return; // App routes will handle redirect
      }
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update partial fields and refresh local state
  const updateMe = useCallback(async (patch) => {
    const { profile } = await api("/accounts/me", { method: "PUT", body: patch });
    setProfile(profile);
    return profile;
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

