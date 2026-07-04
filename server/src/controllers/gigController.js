import {
  createGig,
  updateGig,
  deleteGig,
  getFilteredGigs,
  getMyGigs as getMyGigsService,
  getSingleGig,
} from "../services/gigService.js";
import { sendSuccess } from "../utils/sendResponse.js";
import { GIG_CATEGORIES } from "../constants/gigCategories.js";

export const create = async (req, res) => {
  const gig = await createGig(req.body, req.file, req.user.userId);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Gig created successfully.",
    data: gig,
  });
};

export const update = async (req, res) => {
  const gig = await updateGig(
    req.params.id,
    req.body,
    req.file,
    req.user.userId,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Gig updated successfully.",
    data: gig,
  });
};

export const remove = async (req, res) => {
  await deleteGig(req.params.id, req.user.userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Gig deleted successfully.",
  });
};

export const getAll = async (req, res) => {
  const result = await getFilteredGigs(req.query);

  return sendSuccess(res, {
    statusCode: 200,
    data: result,
  });
};

export const getMyGigs = async (req, res) => {
  const gigs = await getMyGigsService(req.user.userId);

  return sendSuccess(res, {
    statusCode: 200,
    data: gigs,
  });
};

export const getCategories = (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    data: GIG_CATEGORIES,
  });
};

export const getSingle = async (req, res) => {
  const gig = await getSingleGig(req.params.id);

  return sendSuccess(res, {
    statusCode: 200,
    data: gig,
  });
};
