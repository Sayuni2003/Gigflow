import {
  getFreelancerEarnings,
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

export const getFreelancerEarningsController = async (req, res) => {
  const earnings = await getFreelancerEarnings(req.user.userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Freelancer earnings fetched successfully.",
    data: earnings,
  });
};
