import stripe from "../config/stripe.js";
import env from "../config/env.js";
import { PAYMENT_STATUSES, PLATFORM_FEE } from "../constants/payment.js";
import * as paymentRepository from "../repositories/PaymentRepository.js";
import * as userRepository from "../repositories/UserRepository.js";
import { ApiError } from "../utils/apiError.js";

export const onboardFreelancer = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (!user.stripeAccountId) {
    let account;
    try {
      account = await stripe.accounts.create({
        type: "express",
        email: user.email,
      });
    } catch (err) {
      console.error("Stripe account creation failed:", err);
      throw new ApiError(500, "Failed to create Stripe Connect account.");
    }

    user.stripeAccountId = account.id;
    await userRepository.save(user);
  }

  let accountLink;
  try {
    accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${env.CLIENT_URL}/onboarding/refresh`,
      return_url: `${env.CLIENT_URL}/onboarding/complete`,
      type: "account_onboarding",
    });
  } catch (err) {
    console.error("Stripe account link creation failed:", err);
    throw new ApiError(500, "Failed to generate Stripe onboarding link.");
  }

  return { url: accountLink.url };
};

export const createPaymentForOrder = async (order) => {
  const client = await userRepository.findById(order.clientId);

  if (!client) {
    throw new ApiError(404, "Client not found.");
  }

  if (!client.stripeCustomerId) {
    let customer;
    try {
      customer = await stripe.customers.create({ email: client.email });
    } catch (err) {
      console.error("Stripe customer creation failed:", err);
      throw new ApiError(500, "Failed to create Stripe customer.");
    }

    client.stripeCustomerId = customer.id;
    await userRepository.save(client);
  }

  const amount = order.gigSnapshot.price;
  const platformFee = (amount * PLATFORM_FEE) / 100;
  const freelancerPayout = amount - platformFee;

  if (freelancerPayout <= 0) {
    throw new ApiError(400, "Gig price must exceed the platform fee.");
  }

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: client.stripeCustomerId,
      capture_method: "manual",
      metadata: { orderId: order._id.toString() },
    });
  } catch (err) {
    console.error("Stripe PaymentIntent creation failed:", err);
    throw new ApiError(500, "Failed to create payment intent.");
  }

  const payment = await paymentRepository.create({
    orderId: order._id,
    clientId: order.clientId,
    freelancerId: order.freelancerId,
    stripePaymentIntentId: paymentIntent.id,
    amount,
    platformFee,
    freelancerPayout,
    status: PAYMENT_STATUSES.PENDING,
  });

  return { payment, clientSecret: paymentIntent.client_secret };
};

export const transferPayoutForOrder = async (order) => {
  const payment = await paymentRepository.findByOrderId(order._id);

  if (!payment) {
    throw new ApiError(404, "Payment not found for this order.");
  }

  if (payment.status !== PAYMENT_STATUSES.CAPTURED) {
    throw new ApiError(
      409,
      `Cannot transfer payout while payment status is ${payment.status}.`,
    );
  }

  const freelancer = await userRepository.findById(order.freelancerId);

  if (!freelancer) {
    throw new ApiError(404, "Freelancer not found.");
  }

  if (!freelancer.payoutsEnabled) {
    throw new ApiError(
      400,
      "Freelancer has not completed Stripe payout verification.",
    );
  }

  let transfer;
  try {
    transfer = await stripe.transfers.create({
      amount: Math.round(payment.freelancerPayout * 100),
      currency: "usd",
      destination: freelancer.stripeAccountId,
      transfer_group: order._id.toString(),
    });
  } catch (err) {
    console.error("Stripe transfer creation failed:", err);
    throw new ApiError(500, "Failed to create payout transfer.");
  }

  payment.stripeTransferId = transfer.id;
  await paymentRepository.save(payment);

  return payment;
};

export const refundPaymentForOrder = async (order) => {
  const payment = await paymentRepository.findByOrderId(order._id);

  if (!payment) {
    return;
  }

  if (payment.status === PAYMENT_STATUSES.TRANSFERRED) {
    throw new ApiError(
      409,
      "Cannot refund a payment that has already been transferred to the freelancer.",
    );
  }

  if (payment.status !== PAYMENT_STATUSES.CAPTURED) {
    throw new ApiError(
      409,
      `Cannot refund a payment while its status is ${payment.status}.`,
    );
  }

  let refund;
  try {
    refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });
  } catch (err) {
    console.error("Stripe refund creation failed:", err);
    throw new ApiError(500, "Failed to create refund.");
  }

  payment.stripeRefundId = refund.id;
  await paymentRepository.save(payment);

  return payment;
};
