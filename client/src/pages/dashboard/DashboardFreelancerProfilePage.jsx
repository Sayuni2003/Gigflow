import DashboardLayout from "../../components/dashboard/DashboardLayout";
import FreelancerProfileContent from "../../components/gigs/FreelancerProfileContent";
import { NAV_ITEMS_BY_ROLE } from "../../config/dashboardNav";
import { useAuth } from "../../hooks/useAuth";

const DashboardFreelancerProfilePage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={NAV_ITEMS_BY_ROLE[user?.role] || []}>
      <FreelancerProfileContent />
    </DashboardLayout>
  );
};

export default DashboardFreelancerProfilePage;
