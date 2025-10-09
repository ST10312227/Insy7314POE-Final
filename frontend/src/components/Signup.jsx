import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";
import AuthLayout from "../layouts/AuthLayout";
import logo from "../assets/thevault_small_logo_blue.png";

const ACCOUNT_RE = /^[A-Za-z0-9\- ]+$/;
const ID_13_DIGITS = /^\d{13}$/;
const hasUpper = /[A-Z]/;
const hasLower = /[a-z]/;
const hasDigit = /\d/;
const hasSymbol = /[^A-Za-z0-9]/;
const HUMAN_NAME_RE = /^[\p{L}][\p{L}\p{M}' -]*$/u;
const DEV_RECAPTCHA = "dev-local-recaptcha-token-aaaaaaaaaaaa";

export default function Signup() {
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

  const validateLocal = () => {
    const { fullName, idNumber, accountNumber, email, password, confirmPassword } = formData;

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const localErr = validateLocal();
    if (localErr) return setApiError(localErr);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, recaptchaToken: DEV_RECAPTCHA }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data?.error || "Signup failed. Try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      alert("Account created successfully!");
      navigate("/dashboard");
    } catch {
      setApiError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="signup-box">
        <img src={logo} alt="The Vault Logo" className="form-logo" />
        <h2 className="signup-title">Create Account</h2>

        {apiError && <div className="error-box">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
          <input name="idNumber" placeholder="ID Number" value={formData.idNumber} onChange={handleChange} />
          <input name="accountNumber" placeholder="Account Number" value={formData.accountNumber} onChange={handleChange} />
          <input name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />

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
    </AuthLayout>
  );
}
