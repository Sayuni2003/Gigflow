import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { ROUTES } from "../utils/constants";

const HomePage = () => {
  return (
    <MainLayout title="GigFlow Client Foundation">
      <p>This is a minimal public route placeholder.</p>
      <div className="row">
        <Link className="button" to={ROUTES.login}>
          Go to Login
        </Link>
        <Link className="button secondary" to={ROUTES.register}>
          Go to Register
        </Link>
      </div>
    </MainLayout>
  );
};

export default HomePage;
