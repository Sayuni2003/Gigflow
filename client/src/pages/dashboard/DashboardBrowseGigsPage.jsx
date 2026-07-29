import DashboardLayout from "../../components/dashboard/DashboardLayout";
import GigBrowseContent from "../../components/gigs/GigBrowseContent";
import { NAV_ITEMS_BY_ROLE } from "../../config/dashboardNav";
import { useAuth } from "../../hooks/useAuth";

const DashboardBrowseGigsPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={NAV_ITEMS_BY_ROLE[user?.role] || []}>
      <GigBrowseContent />
    </DashboardLayout>
  );
};

export default DashboardBrowseGigsPage;
