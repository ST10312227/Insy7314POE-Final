// src/context/AccountContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const AccountCtx = createContext(null);

export function AccountProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    const data = await api("/api/accounts/me");

    // log to see what the backend actually sent
    console.log("Loaded /accounts/me response:", JSON.stringify(data, null, 2));
    //console.log("Loaded /accounts/me response:", data);

    // support both shapes — either { profile: {...} } or {...}
    setProfile(data.profile || data);


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
    const { profile } = await api("/api/accounts/me", { method: "PUT", body: patch });
    setProfile(profile);
    return profile;
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  return (
    <AccountCtx.Provider value={{ profile, loading, error, refresh: loadProfile, updateMe }}>
      {children}
    </AccountCtx.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountCtx);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}

