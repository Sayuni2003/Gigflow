import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate(location.state?.from || ROUTES.dashboard, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Login">
      <form className="grid" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        {error ? <p className="error">{error}</p> : null}

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="top-space">
        Need an account? <Link to={ROUTES.register}>Register</Link>
      </p>
    </MainLayout>
  );
};

export default LoginPage;
