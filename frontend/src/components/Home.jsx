import "./Home.css";
import Navbar from "./Navbar";
import Hero from "./Hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="home-page">
        <Hero />
      </div>
    </>
  );
}
