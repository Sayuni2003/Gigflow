import { validateCreateGigInput } from "../validators/gigValidators.js";
import { uploadImage } from "./storageService.js";
import * as gigRepository from "../repositories/GigRepository.js";
import { ApiError } from "../utils/apiError.js";

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
