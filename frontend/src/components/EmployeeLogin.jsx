import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeLogin.css";
import logo from "../assets/thevault_small_logo_blue.png";
import bg from "../assets/login_signup_background.png";

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const canSubmit = isValidEmail(form.email) && form.password.length >= 6 && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);
      setError("");

      const payload = {
        email: String(form.email || "").trim(),
        password: form.password,
      };

      const res = await fetch("/api/auth/employee/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Login failed.";
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();

      // Store the employee token (keep separate from customer token if you use both)
      localStorage.setItem("employee_token", data.token);
      // Optionally keep profile too
      if (data.profile) localStorage.setItem("employee_profile", JSON.stringify(data.profile));

      // Redirect to Employee Dashboard
      navigate("/employee/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="employee-login" style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="login-card">
        <img src={logo} alt="The Vault Logo" className="form-logo" />
        <h1 className="title">Employee Login</h1>
        <p className="subtitle">Access your internal tools</p>

        {error && <div className="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Work Email</label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="pw-wrap">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              required
              minLength={6}
            />
            <button
              type="button"
              className="button-toggle"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>

          <button className="submit-employee" type="submit" disabled={!canSubmit}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="meta">
          <a href="/forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}
