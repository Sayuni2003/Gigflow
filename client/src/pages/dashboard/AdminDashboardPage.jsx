import { useEffect, useState } from "react";
import { Briefcase, UserPlus, Users } from "lucide-react";
import { getGigs } from "../../api/gigApi";
import { getUsers } from "../../api/userApi";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { ADMIN_NAV_ITEMS } from "../../config/dashboardNav";
import LoadingState from "../../components/ui/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

const ROLE_LABELS = {
  ADMIN: "admin",
  CLIENT: "client",
  FREELANCER: "freelancer",
};

const RECENT_ACTIVITY_COUNT = 5;

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [usersCount, setUsersCount] = useState(0);
  const [gigsCount, setGigsCount] = useState(0);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      setLoading(true);
      setError("");

      try {
        const [usersResponse, gigsResponse] = await Promise.all([
          getUsers(),
          getGigs({ limit: RECENT_ACTIVITY_COUNT, sort: "newest" }),
        ]);

        if (isMounted) {
          const users = usersResponse?.data?.data || [];
          const gigsData = gigsResponse?.data?.data || { gigs: [], total: 0 };

          setUsersCount(users.length);
          setGigsCount(gigsData.total || 0);

          const userActivity = users.slice(0, RECENT_ACTIVITY_COUNT).map((activityUser) => ({
            id: `user-${activityUser.userId}`,
            icon: UserPlus,
            createdAt: activityUser.createdAt,
            description: `${activityUser.fullName} joined as a ${
              ROLE_LABELS[activityUser.role] || activityUser.role
            }`,
          }));

          const gigActivity = gigsData.gigs.map((gig) => ({
            id: `gig-${gig._id}`,
            icon: Briefcase,
            createdAt: gig.createdAt,
            description: `New gig posted: "${gig.title}"`,
          }));

          const combined = [...userActivity, ...gigActivity]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, RECENT_ACTIVITY_COUNT);

          setActivity(combined);
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load the dashboard.");
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

  return (
    <DashboardLayout navItems={ADMIN_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
      </h1>
      <p className="mt-1 text-text-secondary">Platform overview and moderation tools.</p>

      {loading ? <LoadingState label="Loading dashboard..." /> : null}
      {error ? <p className="mt-6 text-danger-text">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icon={Users} label="Total users" value={usersCount} />
            <StatCard icon={Briefcase} label="Total gigs" value={gigsCount} />
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-text-primary">Recent activity</h2>

            {activity.length === 0 ? (
              <div className="mt-4 rounded-xl border border-border bg-bg-card p-6 text-text-secondary">
                No recent activity to show.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-bg-card">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                        <item.icon className="size-4" />
                      </span>
                      <p className="text-sm text-text-primary">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-text-muted">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
