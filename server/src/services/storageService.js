import supabase from "../config/supabase.js";
import env from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export const uploadImage = async (file) => {
  if (!file) {
    throw new ApiError(400, "Image is required.", [
      { field: "image", message: "Please upload an image." },
    ]);
  }

  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;

    const { error } = await supabase.storage
      .from(env.SUPABASE_BUCKET)
      .upload(`gigs/${fileName}`, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new ApiError(500, "Failed to upload image.", [
        { field: "image", message: "Could not upload image to storage." },
      ]);
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(env.SUPABASE_BUCKET)
      .getPublicUrl(`gigs/${fileName}`);

    return publicUrl;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to upload image.", [
      {
        field: "image",
        message: "An unexpected error occurred during upload.",
      },
    ]);
  }
};

export const deleteImage = async (imageUrl) => {
  if (!imageUrl) {
    return;
  }

  try {
    const filePath = imageUrl.split(
      `/storage/v1/object/public/${env.SUPABASE_BUCKET}/`,
    )[1];

    if (!filePath) {
      return;
    }

    const { error } = await supabase.storage
      .from(env.SUPABASE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new ApiError(500, "Failed to delete image from storage.", [
      {
        field: "image",
        message: "Could not delete image from storage.",
      },
    ]);
  }
};
