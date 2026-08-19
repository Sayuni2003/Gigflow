import { useMemo, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { useTheme } from "../../hooks/useTheme";

const CheckoutForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { isDark } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // The CardElement renders in its own iframe, so `color: "inherit"` would
  // inherit from that iframe's document (always black) rather than our page -
  // the theme has to be passed in explicitly.
  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: "16px",
          color: isDark ? "#f8fafc" : "#1f2937",
          "::placeholder": { color: isDark ? "#94a3b8" : "#9ca3af" },
        },
      },
    }),
    [isDark],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (confirmError) {
      console.error("Stripe confirmCardPayment error:", confirmError);
      setError(confirmError.message || "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    // capture_method is "manual" on the backend, so a successful confirm
    // lands on "requires_capture" (funds authorized, not yet captured).
    if (paymentIntent?.status === "requires_capture" || paymentIntent?.status === "succeeded") {
      onSuccess();
      return;
    }

    setError("Payment could not be confirmed.");
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md border border-border bg-bg-main px-3 py-2.5">
        <CardElement options={cardElementOptions} />
      </div>

      {error ? <p className="text-sm text-danger-text">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={!stripe || submitting}>
        {submitting ? "Processing..." : "Pay now"}
      </Button>
    </form>
  );
};

export default CheckoutForm;
