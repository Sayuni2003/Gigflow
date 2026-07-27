import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constants";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-nav">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to={ROUTES.home} className="text-lg font-bold text-primary hover:text-primary-hover">
            GigFlow
          </Link>
          <p className="mt-2 max-w-xs text-sm text-text-secondary">
            Connecting you with vetted freelancers in design, dev, marketing and more.
          </p>
        </div>

        <nav className="flex gap-6 text-sm" aria-label="Footer navigation">
          <Link to={ROUTES.home} className="text-text-secondary hover:text-text-primary">
            Home
          </Link>
          <Link to={ROUTES.login} className="text-text-secondary hover:text-text-primary">
            Login
          </Link>
          <Link to={ROUTES.register} className="text-text-secondary hover:text-text-primary">
            Register
          </Link>
        </nav>
      </div>

      <div className="border-t border-divider px-5 py-4">
        <p className="mx-auto max-w-7xl text-xs text-text-muted">© {year} GigFlow. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
