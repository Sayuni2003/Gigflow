import mongoose from "mongoose";
import Rating from "../models/Rating.js";

export const createRating = (ratingData) => {
  return Rating.create(ratingData);
};

export const getRatingByOrderId = (orderId) => {
  return Rating.findOne({ orderId });
};

export const updateRating = (ratingId, updateData) => {
  return Rating.findByIdAndUpdate(
    ratingId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
};

export const deleteRating = (ratingId) => {
  return Rating.findByIdAndDelete(ratingId);
};

export const getRatingsByFreelancer = (freelancerId) => {
  return Rating.find({ freelancerId })
    .sort({ createdAt: -1 })
    .populate("clientId", "fullName");
};

export const getRatingSummaryForFreelancer = async (freelancerId) => {
  const [summary] = await Rating.aggregate([
    { $match: { freelancerId: new mongoose.Types.ObjectId(freelancerId) } },
    {
      $group: {
        _id: "$freelancerId",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    average: summary ? Number(summary.average.toFixed(2)) : 0,
    count: summary ? summary.count : 0,
  };
};
