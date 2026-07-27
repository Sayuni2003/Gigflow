import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    setError("");

    try {
      await logout();
      navigate(ROUTES.login, { replace: true });
    } catch (logoutError) {
      setError(logoutError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Dashboard">
      <p>This is a minimal protected route placeholder.</p>
      <ul className="mt-3 grid gap-1 text-text-secondary">
        <li>
          <strong className="text-text-primary">Name:</strong> {user?.fullName || "-"}
        </li>
        <li>
          <strong className="text-text-primary">Email:</strong> {user?.email || "-"}
        </li>
        <li>
          <strong className="text-text-primary">Role:</strong> {user?.role || "-"}
        </li>
      </ul>

      {error ? <p className="mt-3 text-danger-text">{error}</p> : null}

      <button
        className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        onClick={handleLogout}
        disabled={loading}
        type="button"
      >
        {loading ? "Signing out..." : "Logout"}
      </button>
    </MainLayout>
  );
};

export default DashboardPage;
