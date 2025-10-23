// src/context/AccountContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../lib/api";

const AccountCtx = createContext(null);

export function AccountProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasToken = () =>
    Boolean(sessionStorage.getItem("token") || localStorage.getItem("token"));

  const loadProfile = useCallback(async () => {
    // If no token, don't call the API (keeps public pages noise-free)
    if (!hasToken()) {
      setProfile(null);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { profile } = await api("/accounts/me"); // GET
      setProfile(profile);
    } catch (err) {
      if (err.status === 401) {
        // Token invalid/expired: clear and leave profile null
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        setProfile(null);
        setError("");
      } else {
        setError(err.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Update partial fields and refresh local state
  const updateMe = useCallback(async (patch) => {
    // IMPORTANT: use PATCH + json so api() sets Content-Type and stringifies
    const { profile } = await api("/accounts/me", { method: "PATCH", json: patch });
    setProfile(profile);
    return profile;
  }, []);

  // Keep context in sync if token changes in another tab (localStorage only triggers 'storage')
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") loadProfile();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadProfile]);

  // Initial load on mount
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
      clearError: () => setError(""),
      logout: () => {
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        setProfile(null);
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
