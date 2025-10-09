import Navbar from "./Navbar";
import "./About.css";

function About() {
  return (
    <>
      <Navbar />
      <div className="about-page">
        <h1>About The Vault</h1>
        <p>
          The Vault is a secure, modern digital banking platform built to simplify
          your financial experience. Manage transfers, pay bills, and track spending
          — all in one place.
        </p>
      </div>
    </>
  );
}

export default About;
