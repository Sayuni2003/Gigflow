import { GIG_CATEGORIES } from "../constants/gigCategories.js";

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeNumber = (value) => {
  if (typeof value === "string") {
    return parseFloat(value);
  }
  return value;
};

const normalizeQueryNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (Array.isArray(value)) {
    return Number.NaN;
  }

  return Number(value);
};

const normalizeTags = (value) => {
  if (!value) {
    return [];
  }

  // Handle JSON string from multipart/form-data
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const trimmedTags = value
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter((tag) => tag.length > 0);

  const lowerCaseMap = new Map();
  const uniqueTags = [];

  for (const tag of trimmedTags) {
    const lowerTag = tag.toLowerCase();
    if (!lowerCaseMap.has(lowerTag)) {
      lowerCaseMap.set(lowerTag, true);
      uniqueTags.push(tag);
    }
  }

  return uniqueTags;
};

export const validateCreateGigInput = (payload) => {
  const title = normalizeText(payload.title);
  const description = normalizeText(payload.description);
  const category = normalizeText(payload.category);
  const price = normalizeNumber(payload.price);
  const deliveryTime = normalizeNumber(payload.deliveryTime);

  const errors = [];

  if (!title) {
    errors.push({ field: "title", message: "Title is required." });
  }

  if (!description) {
    errors.push({ field: "description", message: "Description is required." });
  }

  if (!category) {
    errors.push({ field: "category", message: "Category is required." });
  } else if (!GIG_CATEGORIES.includes(category)) {
    errors.push({ field: "category", message: "Invalid category selected." });
  }

  if (typeof price !== "number" || price <= 0) {
    errors.push({
      field: "price",
      message: "Price must be a positive number.",
    });
  }

  if (typeof deliveryTime !== "number" || deliveryTime <= 0) {
    errors.push({
      field: "deliveryTime",
      message: "Delivery time must be a positive number (in days).",
    });
  }

  let tags = [];
  if (
    payload.tags !== undefined &&
    payload.tags !== null &&
    payload.tags !== ""
  ) {
    tags = normalizeTags(payload.tags);
    if (tags === null) {
      errors.push({
        field: "tags",
        message: "Tags must be an array of non-empty strings.",
      });
    } else if (tags.length > 10) {
      errors.push({
        field: "tags",
        message: "Maximum 10 tags per gig.",
      });
    }
  }

  return {
    errors,
    value: {
      title,
      description,
      category,
      price,
      deliveryTime,
      tags: tags === null ? [] : tags,
    },
  };
};

export const validateUpdateGigInput = (payload) => {
  const title =
    payload.title !== undefined ? normalizeText(payload.title) : undefined;
  const description =
    payload.description !== undefined
      ? normalizeText(payload.description)
      : undefined;
  const category =
    payload.category !== undefined
      ? normalizeText(payload.category)
      : undefined;
  const price =
    payload.price !== undefined ? normalizeNumber(payload.price) : undefined;
  const deliveryTime =
    payload.deliveryTime !== undefined
      ? normalizeNumber(payload.deliveryTime)
      : undefined;

  const errors = [];

  if (title !== undefined && !title) {
    errors.push({ field: "title", message: "Title is required." });
  }

  if (description !== undefined && !description) {
    errors.push({ field: "description", message: "Description is required." });
  }

  if (category !== undefined) {
    if (!category) {
      errors.push({ field: "category", message: "Category is required." });
    } else if (!GIG_CATEGORIES.includes(category)) {
      errors.push({ field: "category", message: "Invalid category selected." });
    }
  }

  if (price !== undefined && (typeof price !== "number" || price <= 0)) {
    errors.push({
      field: "price",
      message: "Price must be a positive number.",
    });
  }

  if (
    deliveryTime !== undefined &&
    (typeof deliveryTime !== "number" || deliveryTime <= 0)
  ) {
    errors.push({
      field: "deliveryTime",
      message: "Delivery time must be a positive number (in days).",
    });
  }

  let tags;
  if (
    payload.tags !== undefined &&
    payload.tags !== null &&
    payload.tags !== ""
  ) {
    tags = normalizeTags(payload.tags);
    if (tags === null) {
      errors.push({
        field: "tags",
        message: "Tags must be an array of non-empty strings.",
      });
    } else if (tags.length > 10) {
      errors.push({
        field: "tags",
        message: "Maximum 10 tags per gig.",
      });
    }
  }

  const value = {};
  if (title !== undefined) value.title = title;
  if (description !== undefined) value.description = description;
  if (category !== undefined) value.category = category;
  if (price !== undefined) value.price = price;
  if (deliveryTime !== undefined) value.deliveryTime = deliveryTime;
  if (tags !== undefined) value.tags = tags === null ? [] : tags;

  return {
    errors,
    value,
  };
};

export const validateGigFilterQuery = (query) => {
  const allowedSorts = ["newest", "oldest", "price_asc", "price_desc"];

  const q = normalizeText(query.q);
  const category = normalizeText(query.category);
  const sort = normalizeText(query.sort) || "newest";
  const minPrice = normalizeQueryNumber(query.minPrice);
  const maxPrice = normalizeQueryNumber(query.maxPrice);
  const page = normalizeQueryNumber(query.page) ?? 1;
  const limit = normalizeQueryNumber(query.limit) ?? 12;
  const errors = [];

  if (category && !GIG_CATEGORIES.includes(category)) {
    errors.push({ field: "category", message: "Invalid category selected." });
  }

  if (!allowedSorts.includes(sort)) {
    errors.push({
      field: "sort",
      message: "Sort must be one of: newest, oldest, price_asc, price_desc.",
    });
  }

  if (!Number.isInteger(page) || page < 1) {
    errors.push({ field: "page", message: "Page must be at least 1." });
  }

  if (!Number.isInteger(limit) || limit < 1) {
    errors.push({ field: "limit", message: "Limit must be at least 1." });
  }

  if (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) {
    errors.push({
      field: "minPrice",
      message: "Minimum price must be at least 0.",
    });
  }

  if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
    errors.push({
      field: "maxPrice",
      message: "Maximum price must be at least 0.",
    });
  }

  if (
    Number.isFinite(minPrice) &&
    Number.isFinite(maxPrice) &&
    maxPrice < minPrice
  ) {
    errors.push({
      field: "maxPrice",
      message: "Maximum price must be greater than or equal to minimum price.",
    });
  }

  return {
    errors,
    value: {
      q,
      category,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    },
  };
};
