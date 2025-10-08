import { useState } from "react";
import "./Login.css";
import bg from "../assets/login_signup_background.png";
import logo from "../assets/thevault_small_logo_blue.png";
import eyeOpen from "../assets/password_eye_open.png";
import eyeClosed from "../assets/password_eye_closed.png";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: "",
    idNumber: "",
    password: ""
  });

  // handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // handle form submit (triggered by button OR Enter)
  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload
    console.log("Form submitted:", formData);

    // add MongoDB API call for login validation
    alert("Login submitted!");
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bg})` }}>
      <div className="login-box">
        <img src={logo} alt="The Vault Logo" className="form-logo" />

        <h2 className="login-title">Log in</h2>

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

          {/* Password input with eye icon */}
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
              alt="Toggle visibility"
              className="toggle-password-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button className="login-button" type="submit">
            Log in
          </button>
        </form>

        <a href="#" className="forgot">Forgot Password?</a>

        <p className="terms">
          Terms of Services and Privacy Policy.
          <br />
          Don’t have an Account? <a href="/signup">Create An Account</a>
        </p>
      </div>
    </div>
  );
}

export default Login;