import express from "express";
import validateSession from "../controllers/validate.js";
const router = express.Router();
router.post("/", validateSession);
export default router;
