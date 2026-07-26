import {
  getDisputeById as getDisputeByIdService,
  getDisputes as getDisputesService,
  raiseDispute as raiseDisputeService,
  resolveDispute as resolveDisputeService,
} from "../services/disputeService.js";
import { uploadFile } from "../services/storageService.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/sendResponse.js";
import {
  validateGetDisputeByIdInput,
  validateGetDisputesInput,
  validateRaiseDisputeInput,
  validateResolveDisputeInput,
} from "../validators/disputeValidators.js";

const assertValidInput = ({ errors, value }) => {
  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed.", errors);
  }

  return value;
};

export const raiseDispute = async (req, res) => {
  const { orderId, reason, attachments: linkAttachments } = assertValidInput(
    validateRaiseDisputeInput(req.params, req.body),
  );

  const files = req.files || [];
  const uploadedAttachments = await Promise.all(
    files.map((file) => uploadFile(file, "disputes")),
  );

  const dispute = await raiseDisputeService({
    orderId,
    userId: req.user.userId,
    reason,
    attachments: [...uploadedAttachments, ...linkAttachments],
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Dispute raised successfully.",
    data: dispute,
  });
};

export const getDisputeById = async (req, res) => {
  const { disputeId } = assertValidInput(
    validateGetDisputeByIdInput(req.params),
  );

  const dispute = await getDisputeByIdService({
    disputeId,
    userId: req.user.userId,
    role: req.user.role,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Dispute fetched successfully.",
    data: dispute,
  });
};

export const getDisputes = async (req, res) => {
  const { status } = assertValidInput(validateGetDisputesInput(req.query));

  const disputes = await getDisputesService({ status });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Disputes fetched successfully.",
    data: disputes,
  });
};

export const resolveDispute = async (req, res) => {
  const { disputeId, decision, resolutionNote } = assertValidInput(
    validateResolveDisputeInput(req.params, req.body),
  );

  const dispute = await resolveDisputeService({
    disputeId,
    adminId: req.user.userId,
    decision,
    resolutionNote,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Dispute resolved successfully.",
    data: dispute,
  });
};
