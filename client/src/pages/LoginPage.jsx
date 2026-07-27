import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
    <div className="min-h-screen bg-bg-main">
      <Navbar />

      <main className="flex justify-center px-5 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>Enter your email and password to access your account.</CardDescription>
          </CardHeader>

          <CardContent>
            <form id="login-form" className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error ? <p className="text-sm text-danger-text">{error}</p> : null}
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button type="submit" form="login-form" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
            <p className="text-sm text-text-secondary">
              Need an account?{" "}
              <Link to={ROUTES.register} className="text-primary hover:text-primary-hover">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default LoginPage;
