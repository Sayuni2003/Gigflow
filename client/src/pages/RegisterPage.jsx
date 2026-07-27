import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { AUTH_PUBLIC_REGISTER_ROLES, ROUTES } from "../utils/constants";

const inputClass =
  "rounded-lg border border-border bg-bg-card px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: AUTH_PUBLIC_REGISTER_ROLES[0],
    dateOfBirth: "",
  });
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
      await register(form);
      navigate(ROUTES.login, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Register">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-sm text-text-secondary">
          Name
          <input
            className={inputClass}
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </label>
        <label className="grid gap-1 text-sm text-text-secondary">
          Email
          <input
            className={inputClass}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label className="grid gap-1 text-sm text-text-secondary">
          Password
          <input
            className={inputClass}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <label className="grid gap-1 text-sm text-text-secondary">
          Role
          <select className={inputClass} name="role" value={form.role} onChange={handleChange}>
            {AUTH_PUBLIC_REGISTER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-text-secondary">
          Date of Birth
          <input
            className={inputClass}
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
          />
        </label>

        {error ? <p className="text-danger-text">{error}</p> : null}

        <button
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <p className="mt-4">
        Already have an account? <Link to={ROUTES.login}>Login</Link>
      </p>
    </MainLayout>
  );
};

export default RegisterPage;
