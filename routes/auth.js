import { login, logout, signup } from "../controllers/auth.js";
import validate from "../middlewares/authValidator.js";
import errorValidatorHandler from "../middlewares/errorValidator.js";
import express from "express";
const router = express.Router();
router.post("/register", validate("signup"), errorValidatorHandler, signup);
router.post("/login", validate("login"), errorValidatorHandler, login);
router.post("/logout", logout);
export default router;
