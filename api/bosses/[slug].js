// api/bosses/[slug].js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  const { slug } = req.query;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!slug) return res.status(400).json({ error: "Missing slug" });

  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment");
      return res.status(500).json({ error: "Server misconfigured: missing env" });
    }

    const { data, error } = await supabase
      .from("bosses")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(`Supabase error fetching boss ${slug}:`, error);
      return res.status(500).json({ error: error.message || error });
    }
    if (!data) return res.status(404).json({ error: "not found" });

    return res.status(200).json(data);
  } catch (err) {
    console.error(`Unhandled error in /api/bosses/${slug}:`, err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
