import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDashboardRoute } from "../utils/constants";

const DashboardPage = () => {
  const { user } = useAuth();

  return <Navigate to={getDashboardRoute(user?.role)} replace />;
};

export default DashboardPage;
