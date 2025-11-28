// api/bosses/index.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY; // service key only in server env

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const { data, error } = await supabase
      .from("bosses")    // pastikan tabel bernama "bosses" (sesuaikan bila perlu)
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return res.status(200).json(data || []);
  } catch (err) {
    console.error("api/bosses error:", err);
    return res.status(500).json({ error: err.message || "server error" });
  }
}
