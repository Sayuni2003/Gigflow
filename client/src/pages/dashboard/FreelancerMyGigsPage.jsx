import DashboardLayout from "../../components/dashboard/DashboardLayout";
import MyGigsContent from "../../components/gigs/MyGigsContent";
import { FREELANCER_NAV_ITEMS } from "../../config/dashboardNav";

const FreelancerMyGigsPage = () => (
  <DashboardLayout navItems={FREELANCER_NAV_ITEMS}>
    <MyGigsContent />
  </DashboardLayout>
);

export default FreelancerMyGigsPage;
