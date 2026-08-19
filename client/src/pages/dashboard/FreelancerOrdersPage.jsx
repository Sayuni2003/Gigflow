import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Search } from "lucide-react";
import { getOrders } from "../../api/orderApi";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import FreelancerOrderCard from "../../components/orders/FreelancerOrderCard";
import { FREELANCER_NAV_ITEMS } from "../../config/dashboardNav";
import { Button } from "../../components/ui/button";
import LoadingState from "../../components/ui/LoadingState";
import { ROUTES } from "../../utils/constants";

const FreelancerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getOrders();

        if (isMounted) {
          const receivedOrders = (response?.data?.data || []).filter(
            (order) => order.status !== "PENDING_PAYMENT",
          );
          setOrders(receivedOrders);
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load your orders.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout navItems={FREELANCER_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">My orders</h1>
      <p className="mt-1 text-text-secondary">Orders clients have placed on your gigs.</p>

      {loading ? <LoadingState label="Loading orders..." /> : null}
      {error ? <p className="mt-6 text-danger-text">{error}</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-bg-card p-8 text-center">
          <ClipboardList className="mx-auto size-8 text-text-muted" />
          <p className="mt-3 text-text-secondary">You haven&apos;t received any orders yet.</p>
          <Button asChild className="mt-4">
            <Link to={ROUTES.freelancerMyGigs}>
              <Search className="size-4" />
              View my gigs
            </Link>
          </Button>
        </div>
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {orders.map((order) => (
            <FreelancerOrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default FreelancerOrdersPage;
