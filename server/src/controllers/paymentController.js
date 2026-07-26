import {
  getFreelancerEarnings,
  getPaymentsForUser,
  onboardFreelancer,
} from "../services/paymentService.js";
import { sendSuccess } from "../utils/sendResponse.js";

export const onboardFreelancerController = async (req, res) => {
  const result = await onboardFreelancer(req.user.userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Freelancer onboarding link generated successfully.",
    data: result,
  });
};

export const getPaymentsController = async (req, res) => {
  const payments = await getPaymentsForUser({
    userId: req.user.userId,
    role: req.user.role,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Payments fetched successfully.",
    data: payments,
  });
};

export const getFreelancerEarningsController = async (req, res) => {
  const earnings = await getFreelancerEarnings(req.user.userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Freelancer earnings fetched successfully.",
    data: earnings,
  });
};
