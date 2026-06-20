import {
  validateCreateGigInput,
  validateUpdateGigInput,
} from "../validators/gigValidators.js";
import { uploadImage } from "./storageService.js";
import * as gigRepository from "../repositories/GigRepository.js";
import { ApiError } from "../utils/apiError.js";

const formatGigResponse = (gig) => {
  return {
    _id: gig._id,
    title: gig.title,
    description: gig.description,
    category: gig.category,
    tags: gig.tags,
    price: gig.price,
    deliveryTime: gig.deliveryTime,
    image: gig.image,
    freelancerId: gig.freelancerId,
    createdAt: gig.createdAt,
  };
};

export const createGig = async (payload, file, freelancerId) => {
  const { errors, value } = validateCreateGigInput(payload);

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed.", errors);
  }

  const imageUrl = await uploadImage(file);

  const gigData = {
    ...value,
    image: imageUrl,
    freelancerId,
  };

  const gig = await gigRepository.create(gigData);

  return formatGigResponse(gig);
};

export const updateGig = async (gigId, payload, file, freelancerId) => {
  const gig = await gigRepository.findById(gigId);

  if (!gig) {
    throw new ApiError(404, "Gig not found.");
  }

  if (gig.freelancerId.toString() !== freelancerId) {
    throw new ApiError(403, "You are not authorized to modify this gig.");
  }

  const { errors, value } = validateUpdateGigInput(payload);

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed.", errors);
  }

  let updateData = { ...value };

  if (file) {
    const imageUrl = await uploadImage(file);
    updateData.image = imageUrl;
  }

  const updatedGig = await gigRepository.updateById(gigId, updateData);

  return formatGigResponse(updatedGig);
};

export const deleteGig = async (gigId, freelancerId) => {
  const gig = await gigRepository.findById(gigId);

  if (!gig) {
    throw new ApiError(404, "Gig not found.");
  }

  if (gig.freelancerId.toString() !== freelancerId) {
    throw new ApiError(403, "You are not authorized to modify this gig.");
  }

  await gigRepository.deleteById(gigId);
};

export const getAllGigs = async () => {
  const gigs = await gigRepository.findAll();
  return gigs.map(formatGigResponse);
};

export const getMyGigs = async (freelancerId) => {
  const gigs = await gigRepository.findByFreelancerId(freelancerId);
  return gigs.map(formatGigResponse);
};
