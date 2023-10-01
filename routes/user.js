import { users, search } from "../controllers/user.js";
import express from "express";
const router = express.Router();
router.get("/", users);
router.get("/search/:searchTerm", search);
export default router;
