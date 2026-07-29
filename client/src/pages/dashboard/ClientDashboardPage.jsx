import { Link } from "react-router-dom";
import { Briefcase, Search, Wallet } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { CLIENT_NAV_ITEMS } from "../../config/dashboardNav";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";

const ClientDashboardPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={CLIENT_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
      </h1>
      <p className="mt-1 text-text-secondary">Here&apos;s an overview of your account.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={Briefcase} label="Active orders" value="0" />
        <StatCard icon={Wallet} label="Total spent" value="$0" />
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
        <h2 className="text-lg font-semibold text-text-primary">Recent orders</h2>
        <div className="mt-4 rounded-xl border border-border bg-bg-card p-6 text-text-secondary">
          You haven&apos;t placed any orders yet.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboardPage;
