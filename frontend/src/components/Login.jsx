import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import AuthLayout from "../layouts/AuthLayout";
import logo from "../assets/thevault_small_logo_blue.png";

const ID_13_DIGITS = /^\d{13}$/;
const ACCOUNT_RE = /^[A-Za-z0-9\- ]+$/;
const hasUpper = /[A-Z]/;
const hasLower = /[a-z]/;
const hasDigit = /\d/;
const hasSymbol = /[^A-Za-z0-9]/;
const DEV_RECAPTCHA = "dev-local-recaptcha-token-aaaaaaaaaaaa";

export default function Login() {
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
    const acct = formData.accountNumber.trim();
    const id = formData.idNumber.trim();
    const pw = formData.password;

    if (!acct || acct.length < 6 || acct.length > 32 || !ACCOUNT_RE.test(acct))
      return "Account number must be 6–32 characters.";
    if (!ID_13_DIGITS.test(id)) return "ID number must be exactly 13 digits.";
    if (
      pw.length < 10 ||
      !hasUpper.test(pw) ||
      !hasLower.test(pw) ||
      !hasDigit.test(pw) ||
      !hasSymbol.test(pw)
    )
      return "Password must include upper, lower, number, and symbol.";
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
          accountNumber: formData.accountNumber,
          idNumber: formData.idNumber,
          password: formData.password,
          recaptchaToken: DEV_RECAPTCHA,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data?.error || "Login failed. Try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/app/dashboard");
    } catch (err) {
      setApiError("Could not reach the server. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-box">
        <img src={logo} alt="The Vault Logo" className="form-logo" />
        <h2 className="login-title">Log In</h2>

        {apiError && <div className="error-box">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="accountNumber"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={handleChange}
          />
          <input
            type="text"
            name="idNumber"
            placeholder="ID Number"
            value={formData.idNumber}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <a href="#" className="forgot">Forgot Password?</a>

        <p className="terms">
          Terms of Service and Privacy Policy.<br />
          Don’t have an Account? <Link to="/signup">Create One</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
