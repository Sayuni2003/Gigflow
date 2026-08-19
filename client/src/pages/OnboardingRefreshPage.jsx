import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onboardFreelancer } from "../api/paymentApi";
import { ROUTES } from "../utils/constants";
import { Button } from "../components/ui/button";
import LoadingState from "../components/ui/LoadingState";

const OnboardingRefreshPage = () => {
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const restartOnboarding = async () => {
      try {
        const response = await onboardFreelancer();
        const url = response?.data?.data?.url;

        if (!url) {
          if (isMounted) {
            setError("Couldn't restart payout setup.");
          }
          return;
        }

        window.location.replace(url);
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Couldn't restart payout setup.");
        }
      }
    };

    restartOnboarding();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-main px-5">
      <div className="max-w-md rounded-xl border border-border bg-bg-card p-8 text-center">
        {error ? (
          <>
            <p className="text-danger-text">{error}</p>
            <Button asChild className="mt-6">
              <Link to={ROUTES.freelancerSettings}>Back to settings</Link>
            </Button>
          </>
        ) : (
          <LoadingState label="Your payout setup link expired — starting a new one..." />
        )}
      </div>
    </div>
  );
};

export default OnboardingRefreshPage;
