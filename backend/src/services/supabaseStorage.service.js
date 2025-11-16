import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "../config/env.config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const uploadToSupabase = async (fileBuffer, fileName, folder = "") => {
  const path = folder 
    ? `${folder}/${Date.now()}-${fileName}`
    : `${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from("modipix_images")
    .upload(path, fileBuffer, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("modipix_images")
    .getPublicUrl(path);

  return data.publicUrl;
};
