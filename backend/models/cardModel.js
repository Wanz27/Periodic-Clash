// backend/models/cardModel.js
import { supabase } from "../config/supabase.js";

/**
 * model functions that use supabase server client (service role).
 */

export async function listCards() {
  return supabase.from("cards").select("*").order("created_at", { ascending: false });
}

export async function getCardById(id) {
  return supabase.from("cards").select("*").eq("id", id).maybeSingle();
}

export async function insertCard(payload) {
  // payload is an object that matches card columns
  return supabase.from("cards").insert(payload).select();
}

export async function updateCard(id, payload) {
  return supabase.from("cards").update(payload).eq("id", id).select();
}

export async function deleteCard(id) {
  return supabase.from("cards").delete().eq("id", id);
}

/**
 * helper: upload a file buffer to storage (bucket: card-images)
 * We will call .upload with path and file buffer in the controller.
 */
export async function uploadToStorage(bucket, path, file, contentType) {
  // file: Buffer or ReadableStream (we will pass Buffer from multer)
  return supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: false,
  });
}

export function getPublicUrl(bucket, path) {
  return supabase.storage.from(bucket).getPublicUrl(path);
}
