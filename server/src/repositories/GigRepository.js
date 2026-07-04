import Gig from "../models/Gig.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getSortOption = (sort) => {
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };

  return sortOptions[sort] || sortOptions.newest;
};

export const create = (gigData) => {
  return Gig.create(gigData);
};

export const findById = (gigId) => {
  return Gig.findById(gigId);
};

export const findWithFilters = async ({
  q,
  category,
  tags,
  minPrice,
  maxPrice,
  sort,
  page,
  limit,
}) => {
  const filter = {};

  if (q) {
    filter.$text = { $search: q };
  }

  if (category) {
    filter.category = category;
  }

  if (tags.length > 0) {
    filter.tags = {
      $in: tags.map((tag) => new RegExp(`^${escapeRegExp(tag)}$`, "i")),
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  const skip = (page - 1) * limit;
  const sortOption = getSortOption(sort);

  const [gigs, total] = await Promise.all([
    Gig.find(filter).sort(sortOption).skip(skip).limit(limit),
    Gig.countDocuments(filter),
  ]);

  return { gigs, total };
};

export const findByFreelancerId = (freelancerId) => {
  return Gig.find({ freelancerId }).sort({ createdAt: -1 });
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
