import { Navigate, useLocation } from "react-router-dom";
import LoadingState from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
