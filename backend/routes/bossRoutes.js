import express from "express";
import * as ctrl from "../controllers/bossControllers.js";

const router = express.Router();

// GET /api/bosses
router.get("/", ctrl.getBosses);

// GET /api/bosses/:slug
router.get("/:slug", ctrl.getBossBySlug);

// POST /api/bosses
router.post("/", ctrl.postBoss);

// PUT /api/bosses/:slug
router.put("/:slug", ctrl.putBoss);

// DELETE /api/bosses/:slug
router.delete("/:slug", ctrl.deleteBoss);

export default router;
