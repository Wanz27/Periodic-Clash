// src/config/storage.js
import { supabase } from "./supabaseClient";

/**
 * Upload file ke bucket public dan return publicUrl yang bisa langsung ditampilkan di <img/>
 * - bucketName: 'card-images' (sesuaikan)
 * - filePath: 'cards/<timestamp>-filename.ext'
 */
export async function uploadImageFile(file, filePath, bucketName = "card-images") {
  // upload
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  // ambil public URL (supabase-js v2)
  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  // urlData.publicUrl biasanya sudah siap pakai
  return urlData.publicUrl;
}
