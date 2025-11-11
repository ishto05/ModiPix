import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "../config/env.config.js";

const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY; // use service role key for server uploads
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a file buffer to Supabase Storage
 * @param {Buffer} fileBuffer - File contents
 * @param {string} fileName - Original file name
 * @param {string} folder - Optional folder per user
 * @returns {string} public URL of uploaded file
 */
export const uploadToSupabase = async (fileBuffer, fileName, folder = "") => {
  const path = folder ? `${folder}/${Date.now()}-${fileName}` : `${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from("images") // your bucket name
    .upload(path, fileBuffer, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);

  // Get public URL
  const { publicUrl, error: urlError } = supabase.storage.from("images").getPublicUrl(path);
  if (urlError) throw new Error(urlError.message);

  return publicUrl;
};
