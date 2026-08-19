import GigBrowseContent from "../components/gigs/GigBrowseContent";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

const BrowseGigsPage = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-8">
        <GigBrowseContent />
      </div>

      <Footer />
    </div>
  );
};

export default BrowseGigsPage;
