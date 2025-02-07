import express from "express";
import {
  signup,
  alluser,
  alluserID,
  verifyEmail,
  login,
  resendVerificationToken,
  requestPasswordReset,
  resetPassword
} from "../controllers/Auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// User Routes
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/resend-token", resendVerificationToken);
router.post("/forget-pass", requestPasswordReset);
router.post("/reset-pass", resetPassword);
router.get("/all", alluser);
router.get("/all/:id", alluserID);

// Password Reset Route

export default router;
