import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateUser.css";
import bgImage from "../assets/white_background.png";

// === Same validation rules as Signup ===
const ACCOUNT_RE = /^[A-Za-z0-9\- ]+$/;
const ID_13_DIGITS = /^\d{13}$/;
const hasUpper = /[A-Z]/;
const hasLower = /[a-z]/;
const hasDigit = /\d/;
const hasSymbol = /[^A-Za-z0-9]/;
const HUMAN_NAME_RE = /^[\p{L}][\p{L}\p{M}' -]*$/u;
const DEV_RECAPTCHA = "dev-local-recaptcha-token-aaaaaaaaaaaa";

export default function CreateUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    accountNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Same client-side validation as Signup
  function validateLocal() {
    const { fullName, idNumber, accountNumber, email, password, confirmPassword } = form;

    if (!HUMAN_NAME_RE.test(fullName))
      return "Enter a valid name (letters, hyphens, or spaces only).";
    if (!ID_13_DIGITS.test(idNumber)) return "ID number must be exactly 13 digits.";
    if (!ACCOUNT_RE.test(accountNumber)) return "Invalid account number format.";
    if (!email.includes("@")) return "Invalid email.";
    if (
      password.length < 10 ||
      !hasUpper.test(password) ||
      !hasLower.test(password) ||
      !hasDigit.test(password) ||
      !hasSymbol.test(password)
    )
      return "Password must include upper, lower, number, and symbol.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  }

  const canSubmit = !loading && !validateLocal();

  async function handleSubmit(e) {
    e.preventDefault();
    const localErr = validateLocal();
    if (localErr) return setError(localErr);

    try {
      setLoading(true);
      setError("");

      // Same endpoint as public signup – persists to `users`
      const res = await fetch("/api/auth/register-full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If your backend checks for staff, keep this:
          Authorization: `Bearer ${localStorage.getItem("employee_token") || ""}`,
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          idNumber: form.idNumber.trim(),
          accountNumber: form.accountNumber.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          recaptchaToken: DEV_RECAPTCHA,
          createdByEmployee: true, // optional flag – safe to include
        }),
      });

      let data = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        if (res.status === 409) {
          const msg =
            data?.error ||
            data?.message ||
            "User already exists (duplicate email, ID number, or account number).";
          throw new Error(msg);
        }
        throw new Error(data?.error || data?.message || "Failed to create user.");
      }

      // Success — go back to employee dashboard
      navigate("/employee/dashboard", { replace: true });
      return;
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="employee-create" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="create-card">
        <h1 className="title">Create user</h1>
        <p className="subtitle">Register a new customer account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Jane Doe"
            value={form.fullName}
            onChange={onChange}
            required
          />

          <label htmlFor="idNumber">ID Number (13 digits)</label>
          <input
            id="idNumber"
            name="idNumber"
            type="text"
            inputMode="numeric"
            placeholder="0000000000000"
            value={form.idNumber}
            onChange={onChange}
            required
          />

          <label htmlFor="accountNumber">Account Number</label>
          <input
            id="accountNumber"
            name="accountNumber"
            type="text"
            placeholder="1000 123 0001"
            value={form.accountNumber}
            onChange={onChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="pw-wrap">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••••"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              required
              minLength={10}
            />
            <button
              type="button"
              className="createUser-toggle"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="pw-wrap">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPw2 ? "text" : "password"}
              placeholder="••••••••••"
              value={form.confirmPassword}
              onChange={onChange}
              autoComplete="new-password"
              required
              minLength={10}
            />
            <button
              type="button"
              className="createUser-toggle"
              onClick={() => setShowPw2((s) => !s)}
              aria-label={showPw2 ? "Hide password" : "Show password"}
            >
              {showPw2 ? "Hide" : "Show"}
            </button>
          </div>

          {/* Live hint space */}
          <div style={{ minHeight: 18, marginTop: 6 }}>
            {(() => {
              const v = validateLocal();
              return v ? <div className="hint">{v}</div> : null;
            })()}
          </div>

          <button className="submit-user" type="submit" disabled={!canSubmit}>
            {loading ? "Creating..." : "Create user"}
          </button>
        </form>

        <div className="meta">
          <button
            className="linkish-btn"
            type="button"
            onClick={() => navigate("/employee/dashboard")}
          >
            ← Back to dashboard
          </button>
        </div>
        </div>
      </div>
  );
}
