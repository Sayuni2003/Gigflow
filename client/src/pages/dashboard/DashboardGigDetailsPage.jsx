import DashboardLayout from "../../components/dashboard/DashboardLayout";
import GigDetailsContent from "../../components/gigs/GigDetailsContent";
import { NAV_ITEMS_BY_ROLE } from "../../config/dashboardNav";
import { useAuth } from "../../hooks/useAuth";

const DashboardGigDetailsPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={NAV_ITEMS_BY_ROLE[user?.role] || []}>
      <GigDetailsContent />
    </DashboardLayout>
  );
};

export default DashboardGigDetailsPage;
