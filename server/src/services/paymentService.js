import stripe from "../config/stripe.js";
import env from "../config/env.js";
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
