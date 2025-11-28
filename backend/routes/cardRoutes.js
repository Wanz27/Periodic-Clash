// backend/routes/cards.js
import express from "express";
import multer from "multer";
import * as ctrl from "../controllers/cardControllers.js";

const router = express.Router();

// multer memory storage so we can pass buffer to supabase sdk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", ctrl.listCards);
router.get("/:id", ctrl.getCard);

// create with optional file upload (field name "image")
router.post("/", upload.single("image"), ctrl.createCard);

// update with optional file upload
router.put("/:id", upload.single("image"), ctrl.updateCard);

router.delete("/:id", ctrl.deleteCard);

export default router;
