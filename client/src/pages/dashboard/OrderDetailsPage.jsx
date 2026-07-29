import DashboardLayout from "../../components/dashboard/DashboardLayout";
import OrderDetailsContent from "../../components/orders/OrderDetailsContent";
import { NAV_ITEMS_BY_ROLE } from "../../config/dashboardNav";
import { useAuth } from "../../hooks/useAuth";

const OrderDetailsPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={NAV_ITEMS_BY_ROLE[user?.role] || []}>
      <OrderDetailsContent />
    </DashboardLayout>
  );
};

export default OrderDetailsPage;
