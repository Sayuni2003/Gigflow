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
      <ul>
        <li>
          <strong>Name:</strong> {user?.fullName || "-"}
        </li>
        <li>
          <strong>Email:</strong> {user?.email || "-"}
        </li>
        <li>
          <strong>Role:</strong> {user?.role || "-"}
        </li>
      </ul>

      {error ? <p className="error">{error}</p> : null}

      <button className="button" onClick={handleLogout} disabled={loading} type="button">
        {loading ? "Signing out..." : "Logout"}
      </button>
    </MainLayout>
  );
};

export default DashboardPage;
