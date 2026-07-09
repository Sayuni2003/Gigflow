import stripe from "../config/stripe.js";
import env from "../config/env.js";
import { PAYMENT_EVENT_TYPES, PAYMENT_STATUSES } from "../constants/payment.js";
import Payment from "../models/Payment.js";
import PaymentEvent from "../models/PaymentEvent.js";
import User from "../models/User.js";

const handlePaymentAuthorized = async (event) => {
  const existing = await PaymentEvent.findOne({ stripeEventId: event.id });

  if (existing) {
    return;
  }

  const paymentIntent = event.data.object;
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (!payment) {
    console.warn(
      `No Payment found for PaymentIntent ${paymentIntent.id}; skipping event ${event.id}.`,
    );
    return;
  }

  await PaymentEvent.create({
    paymentId: payment._id,
    orderId: payment.orderId,
    type: PAYMENT_EVENT_TYPES.AUTHORIZED,
    amount: payment.amount,
    stripeEventId: event.id,
  });

  payment.status = PAYMENT_STATUSES.AUTHORIZED;
  await payment.save();

  try {
    await stripe.paymentIntents.capture(payment.stripePaymentIntentId);
  } catch (err) {
    // TODO: handle payment_intent.payment_failed to record capture failures.
    console.error(
      `Stripe capture failed for PaymentIntent ${payment.stripePaymentIntentId}:`,
      err.message,
    );
  }
};

const handlePaymentCaptured = async (event) => {
  const existing = await PaymentEvent.findOne({ stripeEventId: event.id });

  if (existing) {
    return;
  }

  const paymentIntent = event.data.object;
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (!payment) {
    console.warn(
      `No Payment found for PaymentIntent ${paymentIntent.id}; skipping event ${event.id}.`,
    );
    return;
  }

  await PaymentEvent.create({
    paymentId: payment._id,
    orderId: payment.orderId,
    type: PAYMENT_EVENT_TYPES.CAPTURED,
    amount: payment.amount,
    stripeEventId: event.id,
  });

  payment.status = PAYMENT_STATUSES.CAPTURED;
  await payment.save();
};

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
    case "payment_intent.amount_capturable_updated":
      await handlePaymentAuthorized(event);
      break;
    case "payment_intent.succeeded":
      await handlePaymentCaptured(event);
      break;
    default:
      break;
  }

  return res.status(200).json({ received: true });
};
