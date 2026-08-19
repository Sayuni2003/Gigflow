import DashboardLayout from "../../components/dashboard/DashboardLayout";
import GigFormContent from "../../components/gigs/GigFormContent";
import { FREELANCER_NAV_ITEMS } from "../../config/dashboardNav";

const FreelancerGigFormPage = () => (
  <DashboardLayout navItems={FREELANCER_NAV_ITEMS}>
    <GigFormContent />
  </DashboardLayout>
);

export default FreelancerGigFormPage;
