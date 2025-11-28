// backend/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";

import cardsRoutes from "./routes/cardRoutes.js";
import bossRoutes from "./routes/bossRoutes.js";

const app = express();

// allow large payload file -> but we handle files with multer. Keep json limits reasonable.
app.use(cors({
  origin: true // allow all origins (development). Untuk production, set origin: 'https://yourdomain.com'
}));

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/cards", cardsRoutes);

// prefix all boss routes with /api/bosses
app.use("/api/bosses", bossRoutes);

// health
app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

const PORT = process.env.PORT || 2727;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
