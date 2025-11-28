// backend/controllers/cardsController.js
import * as model from "../models/cardModel.js";

// for file uploads we will accept multer file object and call model.uploadToStorage
const BUCKET = process.env.SUPABASE_IMAGE_BUCKET || "card-images";

export async function listCards(req, res) {
  const { data, error } = await model.listCards();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function getCard(req, res) {
  const { id } = req.params;
  const { data, error } = await model.getCardById(id);
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Card not found" });
  res.json(data);
}

export async function createCard(req, res) {
  try {
    let payload = req.body || {};

    // If file uploaded via multer, multer gives req.file
    if (req.file) {
      // create a path: cards/<timestamp>-originalname
      const fname = `cards/${Date.now()}-${req.file.originalname.replace(/\s+/g,'_')}`;
      const { error: upErr } = await model.uploadToStorage(BUCKET, fname, req.file.buffer, req.file.mimetype);
      if (upErr) {
        console.error("Upload error:", upErr);
        return res.status(500).json({ error: upErr.message || upErr });
      }
      const { data: urlData } = model.getPublicUrl(BUCKET, fname);
      payload.image_url = urlData.publicUrl;
    }

    // ensure fields types: reactions/powerups may come as string -> try parse
    if (typeof payload.reactions === "string") {
      try { payload.reactions = JSON.parse(payload.reactions); } catch { payload.reactions = []; }
    }
    if (typeof payload.powerups === "string") {
      try { payload.powerups = JSON.parse(payload.powerups); } catch { payload.powerups = []; }
    }

    const { data, error } = await model.insertCard(payload);
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data?.[0] ?? data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
}

export async function updateCard(req, res) {
  try {
    const { id } = req.params;
    let payload = req.body || {};

    if (req.file) {
      const fname = `cards/${Date.now()}-${req.file.originalname.replace(/\s+/g,'_')}`;
      const { error: upErr } = await model.uploadToStorage(BUCKET, fname, req.file.buffer, req.file.mimetype);
      if (upErr) return res.status(500).json({ error: upErr.message || upErr });
      const { data: urlData } = model.getPublicUrl(BUCKET, fname);
      payload.image_url = urlData.publicUrl;
    }

    if (typeof payload.reactions === "string") {
      try { payload.reactions = JSON.parse(payload.reactions); } catch { payload.reactions = []; }
    }
    if (typeof payload.powerups === "string") {
      try { payload.powerups = JSON.parse(payload.powerups); } catch { payload.powerups = []; }
    }

    const { data, error } = await model.updateCard(id, payload);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data?.[0] ?? data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
}

export async function deleteCard(req, res) {
  try {
    const { id } = req.params;
    const { error } = await model.deleteCard(id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || err });
  }
}
