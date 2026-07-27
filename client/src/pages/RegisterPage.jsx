import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../components/ui/BackButton";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../hooks/useAuth";
import { AUTH_PUBLIC_REGISTER_ROLES, ROUTES } from "../utils/constants";

const ROLE_LABELS = {
  CLIENT: "Client",
  FREELANCER: "Freelancer",
};

const FULL_NAME_PATTERN = "^[A-Za-z]+([ '-][A-Za-z]+)*$";
const MIN_PASSWORD_LENGTH = 8;
const today = new Date().toISOString().split("T")[0];

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

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }));
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
    <div className="relative min-h-screen bg-bg-main">
      <BackButton className="absolute left-5 top-5" />

      <main className="flex min-h-screen items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">Register</CardTitle>
              <CardDescription>Create an account to start hiring or freelancing.</CardDescription>
            </CardHeader>

            <CardContent>
              <form id="register-form" className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    pattern={FULL_NAME_PATTERN}
                    title="Letters, spaces, apostrophes, and hyphens only."
                    required
                  />
                </div>

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
                    minLength={MIN_PASSWORD_LENGTH}
                    title={`At least ${MIN_PASSWORD_LENGTH} characters.`}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">I want to</Label>
                  <Select name="role" value={form.role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTH_PUBLIC_REGISTER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role] || role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    max={today}
                    required
                  />
                </div>

                {error ? <p className="text-sm text-danger-text">{error}</p> : null}
              </form>
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button type="submit" form="register-form" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Register"}
              </Button>
              <p className="text-sm text-text-secondary">
                Already have an account?{" "}
                <Link to={ROUTES.login} className="text-primary hover:text-primary-hover">
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
