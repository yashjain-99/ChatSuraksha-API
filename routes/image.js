import express from "express";
import { getSignature, update } from "../controllers/image.js";
const router = express.Router();
router.get("/getSignature", getSignature);
router.post("/update", update);
export default router;
