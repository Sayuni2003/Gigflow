import CategoryGrid from "../components/home/CategoryGrid";
import Hero from "../components/home/Hero";
import HowItWorks from "../components/home/HowItWorks";
import TrendingGigs from "../components/home/TrendingGigs";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />
      <Hero />
      <CategoryGrid />
      <TrendingGigs />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default HomePage;
