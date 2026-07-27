import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import ThemeToggle from "../ui/ThemeToggle";

const MainLayout = ({ title, children }) => {
  return (
    <main className="mx-auto max-w-3xl px-5 py-6">
      <header className="mb-4 rounded-xl border border-border bg-bg-nav p-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
          <ThemeToggle />
        </div>
        <nav className="mt-3 flex flex-wrap gap-3" aria-label="Main navigation">
          <Link className="text-primary hover:text-primary-hover" to={ROUTES.home}>
            Home
          </Link>
          <Link className="text-primary hover:text-primary-hover" to={ROUTES.login}>
            Login
          </Link>
          <Link className="text-primary hover:text-primary-hover" to={ROUTES.register}>
            Register
          </Link>
          <Link className="text-primary hover:text-primary-hover" to={ROUTES.dashboard}>
            Dashboard
          </Link>
        </nav>
      </header>
      <section className="rounded-xl border border-border bg-bg-card p-4">{children}</section>
    </main>
  );
};

export default MainLayout;
