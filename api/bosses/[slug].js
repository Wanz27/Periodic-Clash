// api/bosses/[slug].js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  const { slug } = req.query;
  if (req.method !== "GET") return res.status(405).end();
  try {
    const { data, error } = await supabase
      .from("bosses")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return res.status(404).json({ error: "not found" });
    return res.status(200).json(data);
  } catch (err) {
    console.error("api/bosses/[slug] err", err);
    return res.status(500).json({ error: err.message });
  }
}
