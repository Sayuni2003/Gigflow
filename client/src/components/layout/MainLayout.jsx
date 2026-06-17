import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constants";

const MainLayout = ({ title, children }) => {
  return (
    <main className="container">
      <header className="card header">
        <h1>{title}</h1>
        <nav className="row" aria-label="Main navigation">
          <Link to={ROUTES.home}>Home</Link>
          <Link to={ROUTES.login}>Login</Link>
          <Link to={ROUTES.register}>Register</Link>
          <Link to={ROUTES.dashboard}>Dashboard</Link>
        </nav>
      </header>
      <section className="card">{children}</section>
    </main>
  );
};

export default MainLayout;
