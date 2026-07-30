import FreelancerProfileContent from "../components/gigs/FreelancerProfileContent";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

const FreelancerProfilePage = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-8">
        <FreelancerProfileContent />
      </div>

      <Footer />
    </div>
  );
};

export default FreelancerProfilePage;
