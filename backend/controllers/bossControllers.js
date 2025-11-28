// backend/controllers/bossControllers.js
import * as bossModel from "../models/bossModel.js";

export async function getBosses(req, res) {
  try {
    const bosses = await bossModel.findAllBosses();
    res.json(bosses);
  } catch (err) {
    console.error("getBosses:", err);
    res.status(500).json({ error: err.message || "Failed to fetch bosses" });
  }
}

export async function getBossBySlug(req, res) {
  const { slug } = req.params;
  try {
    const boss = await bossModel.findBossBySlug(slug);
    if (!boss) return res.status(404).json({ error: "Boss not found" });
    res.json(boss);
  } catch (err) {
    console.error("getBossBySlug:", err);
    res.status(500).json({ error: err.message || "Failed to fetch boss" });
  }
}

export async function postBoss(req, res) {
  try {
    const payload = req.body;
    // optionally validate required fields here (slug, name)
    if (!payload.slug || !payload.name) {
      return res.status(400).json({ error: "slug and name required" });
    }
    const created = await bossModel.createBoss(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error("postBoss:", err);
    res.status(500).json({ error: err.message || "Failed to create boss" });
  }
}

export async function putBoss(req, res) {
  const { slug } = req.params;
  const payload = req.body;
  try {
    const updated = await bossModel.updateBossBySlug(slug, payload);
    res.json(updated);
  } catch (err) {
    console.error("putBoss:", err);
    res.status(500).json({ error: err.message || "Failed to update boss" });
  }
}

export async function deleteBoss(req, res) {
  const { slug } = req.params;
  try {
    await bossModel.deleteBossBySlug(slug);
    res.json({ ok: true });
  } catch (err) {
    console.error("deleteBoss:", err);
    res.status(500).json({ error: err.message || "Failed to delete boss" });
  }
}
