import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, register, generateMfa, verifyMfa, validateMfa, me, logout } from "../controllers/authController.js";
import { requireAuth, requireMfaPending } from "../middlewares/auth.js";

const router = Router();

const limiter = rateLimit({ windowMs: 60_000, max: 30 });
router.use(limiter);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

router.post("/mfa/generate", requireAuth, generateMfa);
router.post("/mfa/verify", requireAuth, verifyMfa);
router.post("/mfa/validate", requireMfaPending, validateMfa);

export default router;
