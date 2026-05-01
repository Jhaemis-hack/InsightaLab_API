import { Router } from "express";
import {
  redirectToGitHub,
  handleGitHubCallback,
  handleCliCallback,
  refreshTokens,
  logout,
  getMe,
} from "./auth.controller";
import auth_N from "../../middleware/AuthN";

const router = Router();

// GitHub OAuth initiation — browser opens this
router.get("/github", redirectToGitHub);

// GitHub OAuth callback — GitHub redirects here
router.get("/github/callback", handleGitHubCallback);

// CLI posts here after capturing its localhost callback
router.post("/cli/callback", handleCliCallback);

// Token rotation — both CLI and web
router.post("/refresh/token", refreshTokens);

router.post("/logout", auth_N, logout);

router.get("/me", auth_N, getMe);

export default router;
