import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { ROUTES } from "../utils/constants";

const NotFoundPage = () => {
  return (
    <MainLayout title="Page Not Found">
      <p>The page you requested does not exist.</p>
      <Link className="button" to={ROUTES.home}>
        Back to Home
      </Link>
    </MainLayout>
  );
};

export default NotFoundPage;
