// backend/routes/profileRoutes.js
import express from "express";
import multer from "multer";
import { getProfile, upsertProfile } from "../controllers/profileController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

// Route base will be mounted at /api in your index.js, so endpoints:
// GET  /api/public-profiles
// POST /api/public-profiles
router.get("/public-profiles", getProfile);

// Accept multipart form with 'avatar' file (optional)
router.post("/public-profiles", upload.single("avatar"), upsertProfile);

export default router;
