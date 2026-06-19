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
