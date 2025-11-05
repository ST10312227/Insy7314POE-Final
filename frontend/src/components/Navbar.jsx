import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import logoWhite from "../assets/thevault_logo_white.png"; // for homepage (blue background)
import logoBlue from "../assets/thevault_logo_blue.png";   // for login & employee-login (white background)

function Navbar() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isEmployeeLoginPage = location.pathname === "/employee-login";

  // if login or employee-login → use white navbar
  const isAuthPage = isLoginPage || isEmployeeLoginPage;

  return (
    <nav className={`navbar ${isAuthPage ? "navbar-login" : ""}`}>
      <div className="logo">
        <img
          src={isAuthPage ? logoBlue : logoWhite}
          alt="The Vault Logo"
          className="logo-img"
        />
      </div>

      <ul className={`nav-links ${isAuthPage ? "nav-links-login" : ""}`}>
        <li><Link to="/">Home</Link></li>
        <li>|</li>
        <li><Link to="/about">About Us</Link></li>
        <li>|</li>

        {/* Show "Log In" normally; on /login show "Employee Login" instead */}
        {!isLoginPage && <li><Link to="/login">Log In</Link></li>}
        {isLoginPage && <li><Link to="/employee-login">Employee Login</Link></li>}
      </ul>
    </nav>
  );
}

export default Navbar;
