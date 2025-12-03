// api/bosses/index.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // DEBUG: ensure env visible in logs (but don't print secrets)
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment");
      return res.status(500).json({ error: "Server misconfigured: missing env" });
    }

    // Ensure table exists; this will error if table missing
    const { data, error } = await supabase
      .from("bosses")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      // log full error for debugging
      console.error("Supabase error fetching bosses:", error);
      return res.status(500).json({ error: error.message || error });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error("Unhandled error in /api/bosses:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
