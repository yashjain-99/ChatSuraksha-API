import express from "express";
import { getInbox } from "../controllers/inbox.js";
const router = express.Router();
router.get("/:userId", getInbox);
export default router;
