import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, DollarSign, PlusCircle, Star } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PayoutSetupBanner from "../../components/dashboard/PayoutSetupBanner";
import StatCard from "../../components/dashboard/StatCard";
import FreelancerOrderCard from "../../components/orders/FreelancerOrderCard";
import { FREELANCER_NAV_ITEMS } from "../../config/dashboardNav";
import { Button } from "../../components/ui/button";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { getMyGigs } from "../../api/gigApi";
import { getOrders } from "../../api/orderApi";
import { getFreelancerEarnings } from "../../api/paymentApi";
import { getFreelancerRatings } from "../../api/ratingApi";
import { ROUTES } from "../../utils/constants";

const PENDING_ORDER_STATUSES = [
  "PENDING_ACCEPTANCE",
  "IN_PROGRESS",
  "DELIVERED",
  "REVISION_REQUESTED",
  "DISPUTED",
];
const PENDING_ORDERS_PREVIEW_COUNT = 4;

const FreelancerDashboardPage = () => {
  const { user } = useAuth();
  const [gigsCount, setGigsCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!user?.id) {
      return undefined;
    }

    const fetchOverview = async () => {
      setLoading(true);
      setError("");

      try {
        const [gigsResponse, earningsResponse, ordersResponse, ratingsResponse] = await Promise.all([
          getMyGigs(),
          getFreelancerEarnings(),
          getOrders(),
          getFreelancerRatings(user.id).catch(() => null),
        ]);

        if (isMounted) {
          setGigsCount((gigsResponse?.data?.data || []).length);
          setTotalEarned(earningsResponse?.data?.data?.totalEarned ?? 0);
          setPendingOrders(
            (ordersResponse?.data?.data || []).filter((order) =>
              PENDING_ORDER_STATUSES.includes(order.status),
            ),
          );
          setRatings(ratingsResponse?.data?.data || null);
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
  }, [user?.id]);

  const averageRatingLabel = ratings?.count > 0 ? `${ratings.average} ★` : "—";

  return (
    <DashboardLayout navItems={FREELANCER_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
      </h1>
      <p className="mt-1 text-text-secondary">Here&apos;s how your gigs are performing.</p>

      {!user?.payoutsEnabled ? (
        <div className="mt-6">
          <PayoutSetupBanner />
        </div>
      ) : null}

      {loading ? <LoadingState label="Loading your dashboard..." /> : null}
      {error ? <p className="mt-6 text-danger-text">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={ClipboardList} label="Active gigs" value={gigsCount} />
            <StatCard icon={DollarSign} label="Total earnings" value={`$${totalEarned}`} />
            <StatCard icon={Star} label="Average rating" value={averageRatingLabel} />
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-text-primary">Quick actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={ROUTES.dashboardBrowseGigs}>
                  <PlusCircle className="size-4" />
                  Browse gigs
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-text-primary">Pending orders</h2>
              {pendingOrders.length > 0 ? (
                <Link
                  to={ROUTES.freelancerOrders}
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  View all
                </Link>
              ) : null}
            </div>

            {pendingOrders.length === 0 ? (
              <div className="mt-4 rounded-xl border border-border bg-bg-card p-6 text-text-secondary">
                You don&apos;t have any pending orders yet.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {pendingOrders.slice(0, PENDING_ORDERS_PREVIEW_COUNT).map((order) => (
                  <FreelancerOrderCard key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </DashboardLayout>
  );
};

export default FreelancerDashboardPage;
