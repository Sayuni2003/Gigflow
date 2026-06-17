import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { AUTH_PUBLIC_REGISTER_ROLES, ROUTES } from "../utils/constants";

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
      <form className="grid" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </label>
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
        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange}>
            {AUTH_PUBLIC_REGISTER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date of Birth
          <input
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
          />
        </label>

        {error ? <p className="error">{error}</p> : null}

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <p className="top-space">
        Already have an account? <Link to={ROUTES.login}>Login</Link>
      </p>
    </MainLayout>
  );
};

export default RegisterPage;
