import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";
import { getInitials } from "../../utils/getInitials";

const ROLE_LABELS = {
  ADMIN: "Admin",
  CLIENT: "Client",
  FREELANCER: "Freelancer",
};

const DashboardSidebar = ({ items, collapsed, onToggleCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-bg-nav transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
        {collapsed ? null : (
          <Link to={ROUTES.home} className="text-lg font-bold text-primary hover:text-primary-hover">
            GigFlow
          </Link>
        )}

        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-soft hover:text-text-primary",
            collapsed && "mx-auto",
          )}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      <div className="border-b border-border p-3">
        <div
          className={cn("flex items-center gap-3 rounded-lg px-2 py-2", collapsed && "justify-center px-0")}
          title={collapsed ? `${user?.fullName || "—"} · ${ROLE_LABELS[user?.role] || user?.role || "—"}` : undefined}
        >
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt=""
              className="size-9 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
              {getInitials(user?.fullName)}
            </span>
          )}

          {collapsed ? null : (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{user?.fullName || "—"}</p>
              <p className="truncate text-xs text-text-muted">
                {ROLE_LABELS[user?.role] || user?.role || "—"}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {items.map(({ label, icon: Icon, to, disabled }) =>
          disabled ? (
            <span
              key={label}
              title={collapsed ? `${label} (coming soon)` : "Coming soon"}
              className={cn(
                "flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {collapsed ? null : label}
            </span>
          ) : (
            <NavLink
              key={label}
              to={to}
              end
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary-soft text-primary"
                    : "text-text-secondary hover:bg-bg-soft hover:text-text-primary",
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {collapsed ? null : label}
            </NavLink>
          ),
        )}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-text-primary hover:bg-bg-soft",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {collapsed ? null : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
