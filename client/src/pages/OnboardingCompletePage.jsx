import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";
import { Button } from "../components/ui/button";

const OnboardingCompletePage = () => {
  const { refreshUser } = useAuth();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-main px-5">
      <div className="max-w-md rounded-xl border border-border bg-bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success-text" />
        <h1 className="mt-4 text-2xl font-bold text-text-primary">Payout setup submitted</h1>
        <p className="mt-2 text-text-secondary">
          Stripe is verifying your details. This can take a few minutes - you&apos;ll be able to
          receive payouts as soon as it&apos;s confirmed.
        </p>
        <Button asChild className="mt-6">
          <Link to={ROUTES.freelancerDashboard}>Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default OnboardingCompletePage;
