import stripe from "../config/stripe.js";
import env from "../config/env.js";
import { PAYMENT_STATUSES, PLATFORM_FEE } from "../constants/payment.js";
import { USER_ROLES } from "../models/User.js";
import * as paymentRepository from "../repositories/PaymentRepository.js";
import * as userRepository from "../repositories/UserRepository.js";
import { ApiError } from "../utils/apiError.js";

const formatPaymentResponse = (payment) => {
  return {
    orderId: payment.orderId,
    status: payment.status,
    amount: payment.amount,
    platformFee: payment.platformFee,
    freelancerPayout: payment.freelancerPayout,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
};

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
      // Card only: redirect-based methods (Klarna, Cash App, etc.) don't fit
      // the manual-capture escrow flow and require a return_url to confirm.
      payment_method_types: ["card"],
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

export const capturePaymentForOrder = async (order) => {
  const payment = await paymentRepository.findByOrderId(order._id);

  if (!payment) {
    throw new ApiError(404, "Payment not found for this order.");
  }

  if (payment.status !== PAYMENT_STATUSES.AUTHORIZED) {
    throw new ApiError(
      409,
      `Cannot capture payment while its status is ${payment.status}.`,
    );
  }

  try {
    await stripe.paymentIntents.capture(payment.stripePaymentIntentId);
  } catch (err) {
    console.error("Stripe capture failed:", err);
    throw new ApiError(500, "Failed to capture payment.");
  }

  return payment;
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

  // Already released — safe to retry the order transition.
  if (payment.status === PAYMENT_STATUSES.CANCELED) {
    return payment;
  }

  // Capture only happens on acceptance and cancellation is only allowed
  // before acceptance, so the payment can only be PENDING or AUTHORIZED here.
  if (
    payment.status !== PAYMENT_STATUSES.PENDING &&
    payment.status !== PAYMENT_STATUSES.AUTHORIZED
  ) {
    throw new ApiError(
      409,
      `Cannot cancel a payment while its status is ${payment.status}.`,
    );
  }

  try {
    await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
  } catch (err) {
    console.error("Stripe PaymentIntent cancellation failed:", err);
    throw new ApiError(500, "Failed to release the payment hold.");
  }

  return payment;
};

export const getPaymentForOrder = async ({ orderId, userId }) => {
  const payment = await paymentRepository.findByOrderId(orderId);

  if (!payment) {
    throw new ApiError(404, "Payment not found for this order.");
  }

  if (
    payment.clientId.toString() !== userId &&
    payment.freelancerId.toString() !== userId
  ) {
    throw new ApiError(403, "You are not authorized to view this payment.");
  }

  return formatPaymentResponse(payment);
};

export const getPaymentsForUser = async ({ userId, role }) => {
  let filter;

  if (role === USER_ROLES.CLIENT) {
    filter = { clientId: userId };
  } else if (role === USER_ROLES.FREELANCER) {
    filter = { freelancerId: userId };
  } else {
    throw new ApiError(403, "You are not authorized to access payments.");
  }

  const payments = await paymentRepository.findByUser(filter);

  return payments.map(formatPaymentResponse);
};

export const getFreelancerEarnings = async (freelancerId) => {
  const result =
    await paymentRepository.aggregateEarningsByFreelancer(freelancerId);
  const earnings = result[0] || { totalEarned: 0, completedOrders: 0 };

  return {
    totalEarned: earnings.totalEarned,
    completedOrders: earnings.completedOrders,
  };
};
