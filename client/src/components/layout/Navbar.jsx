import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";
import ThemeToggle from "../ui/ThemeToggle";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      navigate(ROUTES.home, { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg-nav">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3"
        aria-label="Main navigation"
      >
        <Link to={ROUTES.home} className="text-lg font-bold text-primary hover:text-primary-hover">
          GigFlow
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to={ROUTES.dashboard}
                className="text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg bg-bg-soft px-3 py-1.5 text-sm font-semibold text-text-primary hover:bg-border disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loggingOut ? "Signing out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to={ROUTES.login}
                className="text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                Login
              </Link>
              <Link
                to={ROUTES.register}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Register
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
