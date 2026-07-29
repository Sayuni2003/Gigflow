import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { onboardFreelancer } from "../../api/paymentApi";
import { Button } from "../ui/button";

const PayoutSetupBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetupClick = async () => {
    setError("");
    setLoading(true);

    // Open the tab synchronously (before the await) so browsers don't treat
    // it as an unrequested popup and block it.
    const onboardingTab = window.open("", "_blank");

    try {
      const response = await onboardFreelancer();
      const url = response?.data?.data?.url;

      if (!url) {
        onboardingTab?.close();
        setError("Couldn't start payout setup.");
        return;
      }

      if (onboardingTab) {
        onboardingTab.location.href = url;
      }
    } catch (err) {
      onboardingTab?.close();
      setError(err?.response?.data?.message || "Couldn't start payout setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-warning-text/30 bg-warning-soft p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-text" />
        <div>
          <p className="font-semibold text-text-primary">Set up payouts to get paid</p>
          <p className="mt-1 text-sm text-text-secondary">
            You haven&apos;t connected a payout account yet. Clients can still order your gigs,
            but you won&apos;t receive any money until you complete Stripe payout setup.
          </p>
          {error ? <p className="mt-2 text-sm text-danger-text">{error}</p> : null}
        </div>
      </div>

      <Button onClick={handleSetupClick} disabled={loading} className="shrink-0">
        {loading ? "Opening..." : "Set up payouts"}
      </Button>
    </div>
  );
};

export default PayoutSetupBanner;
