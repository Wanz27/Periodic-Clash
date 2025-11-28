// backend/models/bossModel.js
import { supabase } from "../config/supabase.js";

/**
 * Boss model functions — return either data or throw error
 */

export async function findAllBosses() {
  const { data, error } = await supabase
    .from("bosses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function findBossBySlug(slug) {
  const { data, error } = await supabase
    .from("bosses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

export async function createBoss(payload) {
  // payload should be object with slug, name, image_url, difficulty, hp, dmg, description, skills (JSON array)
  const { data, error } = await supabase
    .from("bosses")
    .insert(payload)
    .select();

  if (error) throw error;
  return data;
}

export async function updateBossBySlug(slug, payload) {
  const { data, error } = await supabase
    .from("bosses")
    .update(payload)
    .eq("slug", slug)
    .select();

  if (error) throw error;
  return data;
}

export async function deleteBossBySlug(slug) {
  const { data, error } = await supabase
    .from("bosses")
    .delete()
    .eq("slug", slug);

  if (error) throw error;
  return data;
}
