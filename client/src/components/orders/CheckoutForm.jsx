import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "inherit",
      "::placeholder": { color: "#9ca3af" },
    },
  },
};

const CheckoutForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error ? <p className="text-sm text-danger-text">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={!stripe || submitting}>
        {submitting ? "Processing..." : "Pay now"}
      </Button>
    </form>
  );
};

export default CheckoutForm;
