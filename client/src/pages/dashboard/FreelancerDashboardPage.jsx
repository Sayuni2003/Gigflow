import { Link } from "react-router-dom";
import { ClipboardList, DollarSign, PlusCircle, Star } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { FREELANCER_NAV_ITEMS } from "../../config/dashboardNav";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";

const FreelancerDashboardPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={FREELANCER_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
      </h1>
      <p className="mt-1 text-text-secondary">Here&apos;s how your gigs are performing.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={ClipboardList} label="Active gigs" value="0" />
        <StatCard icon={DollarSign} label="Total earnings" value="$0" />
        <StatCard icon={Star} label="Average rating" value="—" />
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
        <h2 className="text-lg font-semibold text-text-primary">Pending orders</h2>
        <div className="mt-4 rounded-xl border border-border bg-bg-card p-6 text-text-secondary">
          You don&apos;t have any pending orders yet.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboardPage;
