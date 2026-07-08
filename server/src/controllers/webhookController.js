import stripe from "../config/stripe.js";
import env from "../config/env.js";
import User from "../models/User.js";

export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Webhook signature verification failed." });
  }

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object;
      await User.findOneAndUpdate(
        { stripeAccountId: account.id },
        { payoutsEnabled: account.payouts_enabled },
      );
      break;
    }
    default:
      break;
  }

  return res.status(200).json({ received: true });
};
