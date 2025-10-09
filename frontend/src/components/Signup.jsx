import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";
import bg from "../assets/login_signup_background.png";
import logo from "../assets/thevault_small_logo_blue.png";
import eyeOpen from "../assets/password_eye_open.png";
import eyeClosed from "../assets/password_eye_closed.png";

// ===== client-side validators to mirror your Zod rules =====
const ACCOUNT_RE = /^[A-Za-z0-9\- ]+$/;
const ID_13_DIGITS = /^\d{13}$/;
const hasUpper = /[A-Z]/;
const hasLower = /[a-z]/;
const hasDigit = /\d/;
const hasSymbol = /[^A-Za-z0-9]/;
const HUMAN_NAME_RE = /^[\p{L}][\p{L}\p{M}' -]*$/u;

// >= 20 chars to pass your recaptchaEnvelope
const DEV_RECAPTCHA = "dev-local-recaptcha-token-aaaaaaaaaaaa";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    accountNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Light local validation aligned with your Zod schema
  const validateLocal = () => {
    const name = formData.fullName.trim();
    const id = formData.idNumber.trim();
    const acct = (formData.accountNumber || "").trim();
    const email = formData.email.trim();
    const pw = formData.password;
    const cpw = formData.confirmPassword;

    if (!name || name.length < 2 || name.length > 120 || !HUMAN_NAME_RE.test(name)) {
      return "Full name must be 2–120 letters (allowed: spaces, apostrophes, hyphens).";
    }
    if (!ID_13_DIGITS.test(id)) return "ID number must be exactly 13 digits.";
    if (!acct || acct.length < 6 || acct.length > 32 || !ACCOUNT_RE.test(acct)) {
      return "Account number must be 6–32 characters (letters, numbers, spaces, hyphens).";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email.";
    if (
      pw.length < 10 ||
      !hasUpper.test(pw) ||
      !hasLower.test(pw) ||
      !hasDigit.test(pw) ||
      !hasSymbol.test(pw)
    ) {
      return "Password must be ≥10 chars and include upper, lower, number, and symbol.";
    }
    if (pw !== cpw) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const localErr = validateLocal();
    if (localErr) {
      setApiError(localErr);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/register-full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          idNumber: formData.idNumber.trim(),
          accountNumber: (formData.accountNumber || "").trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          recaptchaToken: DEV_RECAPTCHA,
        }),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : { error: (await res.text())?.slice(0, 200) };

      if (!res.ok) {
        const msgMap = {
          email_exists: "That email is already registered.",
          idnumber_exists: "That ID number is already registered.",
          account_number_exists: "That account number is already in use.",
          "Passwords do not match": "Passwords do not match.",
        };
        setApiError(msgMap[data?.error] || data?.error || `Sign up failed (${res.status}).`);
        return;
      }

      if (data?.token) localStorage.setItem("token", data.token);
      alert("Account created successfully!");
      navigate("/app/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setApiError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page" style={{ backgroundImage: `url(${bg})` }}>
      <div className="signup-box">
        <img src={logo} alt="The Vault Logo" className="form-logo" />
        <h2 className="signup-title">Create Account</h2>

        {apiError && (
          <div
            style={{
              width: "100%",
              marginBottom: "12px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "#ffeaea",
              color: "#b10000",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="idNumber"
            placeholder="ID Number"
            value={formData.idNumber}
            onChange={handleChange}
            required
            inputMode="numeric"
          />
          <input
            type="text"
            name="accountNumber"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="password-input"
              required
              autoComplete="new-password"
            />
            <img
              src={showPassword ? eyeOpen : eyeClosed}
              alt="Toggle password"
              className="toggle-password-icon"
              onClick={() => setShowPassword((s) => !s)}
            />
          </div>

          {/* Confirm password */}
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="password-input"
              required
              autoComplete="new-password"
            />
            <img
              src={showConfirmPassword ? eyeOpen : eyeClosed}
              alt="Toggle confirm password"
              className="toggle-password-icon"
              onClick={() => setShowConfirmPassword((s) => !s)}
            />
          </div>

          <button className="signup-button" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="terms">
          By creating an account, you agree to The Vault’s <br />
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>

        <p className="switch-login">
          Have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
