import { AlertTriangle, Briefcase, ShieldCheck, Users } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { ADMIN_NAV_ITEMS } from "../../config/dashboardNav";
import { useAuth } from "../../hooks/useAuth";

const AdminDashboardPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={ADMIN_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
      </h1>
      <p className="mt-1 text-text-secondary">Platform overview and moderation tools.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total users" value="0" />
        <StatCard icon={Briefcase} label="Total gigs" value="0" />
        <StatCard icon={AlertTriangle} label="Open disputes" value="0" />
        <StatCard icon={ShieldCheck} label="Pending reviews" value="0" />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-text-primary">Recent activity</h2>
        <div className="mt-4 rounded-xl border border-border bg-bg-card p-6 text-text-secondary">
          No recent activity to show.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
