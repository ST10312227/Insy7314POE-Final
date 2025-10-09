import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import bg from "../assets/login_signup_background.png";
import logo from "../assets/thevault_small_logo_blue.png";
import eyeOpen from "../assets/password_eye_open.png";
import eyeClosed from "../assets/password_eye_closed.png";

// mirror of your Zod rules
const ID_13_DIGITS = /^\d{13}$/;
const ACCOUNT_RE = /^[A-Za-z0-9\- ]+$/;
const hasUpper = /[A-Z]/;
const hasLower = /[a-z]/;
const hasDigit = /\d/;
const hasSymbol = /[^A-Za-z0-9]/;

// >= 20 chars to pass recaptchaEnvelope
const DEV_RECAPTCHA = "dev-local-recaptcha-token-aaaaaaaaaaaa";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formData, setFormData] = useState({
    accountNumber: "",
    idNumber: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validateLocal = () => {
    const acct = formData.accountNumber?.toString().trim();
    const id = formData.idNumber?.toString().trim();
    const pw = formData.password || "";

    if (!acct || acct.length < 6 || acct.length > 32 || !ACCOUNT_RE.test(acct)) {
      return "Account number must be 6–32 characters (letters, numbers, spaces, hyphens).";
    }
    if (!ID_13_DIGITS.test(id)) {
      return "ID number must be exactly 13 digits.";
    }
    if (
      pw.length < 10 ||
      !hasUpper.test(pw) ||
      !hasLower.test(pw) ||
      !hasDigit.test(pw) ||
      !hasSymbol.test(pw)
    ) {
      return "Password must be ≥10 chars and include upper, lower, number, and symbol.";
    }
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: formData.accountNumber.toString().trim(),
          idNumber: formData.idNumber.toString().trim(),
          password: formData.password,
          recaptchaToken: DEV_RECAPTCHA,
        }),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : { error: (await res.text())?.slice(0, 200) };

      if (!res.ok) {
        const msgMap = {
          account_not_found: "We couldn’t find that account number.",
          invalid_credentials: "ID number or password is incorrect.",
          too_many_login_attempts:
            "Too many attempts. Please try again in a few minutes.",
          recaptcha_token_missing: "Captcha missing. Please reload and try again.",
          recaptcha_failed: "Captcha failed. Please try again.",
          recaptcha_error: "Captcha error. Please try again.",
        };
        setApiError(
          msgMap[data?.error] || data?.error || `Login failed (${res.status}).`
        );
        return;
      }

      if (data?.token) localStorage.setItem("token", data.token);
      navigate("/app/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setApiError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bg})` }}>
      <div className="login-box">
        <img src={logo} alt="The Vault Logo" className="form-logo" />
        <h2 className="login-title">Log in</h2>

        {apiError && (
          <div
            style={{
              width: "100%",
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "#ffeaea",
              color: "#b10000",
              fontSize: 14,
              textAlign: "left",
            }}
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="accountNumber"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={handleChange}
            autoComplete="username"
          />
          <input
            type="text"
            name="idNumber"
            placeholder="ID Number"
            value={formData.idNumber}
            onChange={handleChange}
            inputMode="numeric"
          />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="password-input"
              autoComplete="current-password"
            />
            <img
              src={showPassword ? eyeOpen : eyeClosed}
              alt="Toggle visibility"
              className="toggle-password-icon"
              onClick={() => setShowPassword((s) => !s)}
            />
          </div>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <a href="#" className="forgot">Forgot Password?</a>

        <p className="terms">
          Terms of Services and Privacy Policy.
          <br />
          Don’t have an Account? <Link to="/signup">Create An Account</Link>
        </p>
      </div>
    </div>
  );
}
