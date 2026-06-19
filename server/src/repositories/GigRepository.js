import Gig from "../models/Gig.js";

export const create = (gigData) => {
  return Gig.create(gigData);
};

export const findById = (gigId) => {
  return Gig.findById(gigId);
};

export const findByFreelancerId = (freelancerId) => {
  return Gig.find({ freelancerId });
};

export const updateById = (gigId, updateData) => {
  return Gig.findByIdAndUpdate(
    gigId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
};

export const deleteById = (gigId) => {
  return Gig.findByIdAndDelete(gigId);
};
