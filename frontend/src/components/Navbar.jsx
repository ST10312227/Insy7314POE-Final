import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import logoWhite from "../assets/thevault_logo_white.png"; // for homepage (blue background)
import logoBlue from "../assets/thevault_logo_blue.png";   // for login & signup (white background)

function Navbar() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  // if login or signup → use white navbar
  const isAuthPage = isLoginPage || isSignupPage;

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
        {!isLoginPage && <li><Link to="/login">Log In</Link></li>}
        {isLoginPage && <li><Link to="/signup">Sign Up</Link></li>}
      </ul>
    </nav>
  );
}

export default Navbar;