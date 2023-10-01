import { login, signup } from "../controllers/auth.js";
import express from "express";
const router = express.Router();
router.post("/register", signup);
router.post("/login", login);
export default router;
