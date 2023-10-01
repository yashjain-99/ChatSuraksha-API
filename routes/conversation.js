import {
  getConversations,
  createConversation,
} from "../controllers/conversation.js";
import express from "express";
const router = express.Router();
router.get("/:userId", getConversations);
router.post("/", createConversation);
export default router;
