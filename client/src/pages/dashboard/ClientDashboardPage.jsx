import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Search, Wallet } from "lucide-react";
import { getOrders } from "../../api/orderApi";
import { getPayments } from "../../api/paymentApi";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import OrderCard from "../../components/orders/OrderCard";
import StatCard from "../../components/dashboard/StatCard";
import { CLIENT_NAV_ITEMS } from "../../config/dashboardNav";
import { Button } from "../../components/ui/button";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";

const TERMINAL_ORDER_STATUSES = ["COMPLETED", "REJECTED", "CANCELLED", "REFUNDED"];
const SPENT_PAYMENT_STATUSES = ["CAPTURED", "TRANSFERRED"];
const RECENT_ORDERS_PREVIEW_COUNT = 3;

const ClientDashboardPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      setLoading(true);
      setError("");

      try {
        const [ordersResponse, paymentsResponse] = await Promise.all([getOrders(), getPayments()]);

        if (isMounted) {
          setOrders(ordersResponse?.data?.data || []);

          const spent = (paymentsResponse?.data?.data || [])
            .filter((payment) => SPENT_PAYMENT_STATUSES.includes(payment.status))
            .reduce((sum, payment) => sum + payment.amount, 0);
          setTotalSpent(spent);
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load your dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeOrdersCount = orders.filter(
    (order) => !TERMINAL_ORDER_STATUSES.includes(order.status),
  ).length;

  return (
    <DashboardLayout navItems={CLIENT_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
      </h1>
      <p className="mt-1 text-text-secondary">Here&apos;s an overview of your account.</p>

      {loading ? <LoadingState label="Loading your dashboard..." /> : null}
      {error ? <p className="mt-6 text-danger-text">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icon={Briefcase} label="Active orders" value={activeOrdersCount} />
            <StatCard icon={Wallet} label="Total spent" value={`$${totalSpent}`} />
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-text-primary">Quick actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={ROUTES.dashboardBrowseGigs}>
                  <Search className="size-4" />
                  Browse gigs
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-text-primary">Recent orders</h2>
              {orders.length > 0 ? (
                <Link
                  to={ROUTES.clientOrders}
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  View all
                </Link>
              ) : null}
            </div>

            {orders.length === 0 ? (
              <div className="mt-4 rounded-xl border border-border bg-bg-card p-6 text-text-secondary">
                You haven&apos;t placed any orders yet.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {orders.slice(0, RECENT_ORDERS_PREVIEW_COUNT).map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </DashboardLayout>
  );
};

export default ClientDashboardPage;
