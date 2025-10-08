import { useState } from "react";
import "./Signup.css";
import bg from "../assets/login_signup_background.png";
import logo from "../assets/thevault_small_logo_blue.png";
import eyeOpen from "../assets/password_eye_open.png";
import eyeClosed from "../assets/password_eye_closed.png";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    accountNumber: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Account Data:", formData);
    alert("Account created successfully!");
  };

  return (
    <div className="signup-page" style={{ backgroundImage: `url(${bg})` }}>
      <div className="signup-box">
        <img src={logo} alt="The Vault Logo" className="form-logo" />
        <h2 className="signup-title">Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
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
            type="text"
            name="accountNumber"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Password Field */}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="password-input"
            />
            <img
              src={showPassword ? eyeOpen : eyeClosed}
              alt="Toggle password"
              className="toggle-password-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="password-input"
            />
            <img
              src={showConfirmPassword ? eyeOpen : eyeClosed}
              alt="Toggle confirm password"
              className="toggle-password-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>

          <button className="signup-button" type="submit">
            Create Account
          </button>
        </form>

        <p className="terms">
          By creating an account, you agree to The Vault’s <br />
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>

        <p className="switch-login">
          Have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;