// src/components/AccountDetails.jsx
import { useEffect, useMemo, useState } from "react";
import "./AccountDetails.css";
import { FaUser, FaLock, FaUserCircle } from "react-icons/fa";
import { useAccount } from "../context/AccountContext";

function readInitial(p) {
  return {
    fullName: p?.fullName || "",
    idNumber: p?.idNumber || "",
    phone: p?.phone || "",
    email: p?.email || "",
    currency: p?.currency || "ZAR",
  };
}

export default function AccountDetails() {
  const { profile, loading, error, updateMe } = useAccount();
  const [activeTab, setActiveTab] = useState("personal");
  const [form, setForm] = useState(readInitial(profile));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // keep form in sync when profile loads
  useEffect(() => { setForm(readInitial(profile)); }, [profile]);

  const disableAll = loading || saving;

  const canSavePersonal = useMemo(() => {
    if (!profile) return false;
    return (
      form.fullName !== profile.fullName ||
      form.phone    !== profile.phone ||
      form.email    !== profile.email ||
      form.currency !== profile.currency
    );
  }, [form, profile]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const savePersonal = async (e) => {
    e.preventDefault();
    if (!canSavePersonal) return;
    setSaving(true);
    setSaveError("");
    try {
      const patch = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        currency: form.currency,
      };
      await updateMe(patch);
    } catch (err) {
      setSaveError(err.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return <div style={{ padding: 24 }}>Loading account…</div>;
  }
  if (error && !profile) {
    return <div style={{ padding: 24, color: "#b00020" }}>Failed to load: {error}</div>;
  }

  return (
    <div className="account-container">
      {/* LEFT SIDEBAR */}
      <div className="account-sidebar">
        <div className="profile">
          <FaUserCircle className="avatar-icon" />
          <h3>{profile?.fullName || "—"}</h3>
        </div>

        <div className="menu">
          <button
            className={`menu-btn ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            <FaUser /> Personal Details
          </button>
          <button
            className={`menu-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <FaLock /> Security Settings
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="account-form-section">
        {activeTab === "personal" ? (
          <>
            <h2>Personal Details</h2>

            {saveError && (
              <div style={{ color: "#b00020", marginBottom: 8 }}>{saveError}</div>
            )}

            <form className="details-form" onSubmit={savePersonal}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={onChange}
                    disabled={disableAll}
                  />
                </div>
                <div className="form-group">
                  <label>Identity Number</label>
                  <input name="idNumber" value={form.idNumber} readOnly />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cell Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    disabled={disableAll}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    disabled={disableAll}
                  />
                </div>
              </div>

              <div className="form-row single">
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={onChange}
                    disabled={disableAll}
                  >
                    <option value="ZAR">ZAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={!canSavePersonal || disableAll}>
                {saving ? "Saving…" : "Save"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Security Settings</h2>
            {/* This section is read-only placeholder; hook to real endpoints when ready */}
            <form className="details-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value="***************" readOnly />
                </div>
                <div className="form-group">
                  <label>Two-factor Authentication</label>
                  <select defaultValue="ON" disabled>
                    <option>ON</option>
                    <option>OFF</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Recovery Email</label>
                  <input type="email" value={form.email || ""} readOnly />
                </div>
                <div className="form-group">
                  <label>Recovery Number</label>
                  <input type="text" value={form.phone || ""} readOnly />
                </div>
              </div>

              <button type="button" className="save-btn" disabled>
                Save
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
