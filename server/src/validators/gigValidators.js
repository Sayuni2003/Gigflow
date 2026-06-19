import { GIG_CATEGORIES } from "../constants/gigCategories.js";

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeNumber = (value) => {
  if (typeof value === "string") {
    return parseFloat(value);
  }
  return value;
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
