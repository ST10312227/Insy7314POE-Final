import "./AuthLayout.css";
import Navbar from "../components/Navbar";
import bg from "../assets/login_signup_background.png";

export default function AuthLayout({ children }) {
  return (
    <>
      <Navbar />
      <div
        className="auth-layout"
        style={{ backgroundImage: `url(${bg})` }}
      >
        {children}
      </div>
    </>
  );
}
