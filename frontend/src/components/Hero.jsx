import "./Hero.css";
import logo from "../assets/thevault_logo_home_page.png"; 

function Hero() {
  return (
    <section className="hero">
      <img src={logo} alt="The Vault Logo" className="hero-logo" />

    </section>
  );
}

export default Hero;