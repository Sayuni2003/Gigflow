import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { ROUTES } from "../utils/constants";

const HomePage = () => {
  return (
    <MainLayout title="GigFlow Client Foundation">
      <p>This is a minimal public route placeholder.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover"
          to={ROUTES.login}
        >
          Go to Login
        </Link>
        <Link
          className="rounded-lg bg-bg-soft px-4 py-2 font-semibold text-text-primary hover:bg-border"
          to={ROUTES.register}
        >
          Go to Register
        </Link>
      </div>
    </MainLayout>
  );
};

export default HomePage;
