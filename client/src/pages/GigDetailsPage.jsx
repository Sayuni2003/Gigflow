import GigDetailsContent from "../components/gigs/GigDetailsContent";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

const GigDetailsPage = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-8">
        <GigDetailsContent />
      </div>

      <Footer />
    </div>
  );
};

export default GigDetailsPage;
