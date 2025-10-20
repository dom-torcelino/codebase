import jwt from "jsonwebtoken";
import { envVars } from "../config/envVars.js";

export function requireAuth(req, res, next) {
  const token = req.cookies[envVars.COOKIE_NAME] || (req.headers.authorization?.split(" ")[1]);
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, envVars.JWT_SECRET);
    if (payload.type !== "ACCESS") return res.status(401).json({ message: "Invalid token" });
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireMfaPending(req, res, next) {
  const token = req.body.tempToken || req.headers["x-mfa-token"];
  if (!token) return res.status(401).json({ message: "MFA token missing" });
  try {
    const payload = jwt.verify(token, envVars.JWT_SECRET);
    if (payload.type !== "MFA_PENDING") return res.status(401).json({ message: "Invalid MFA token" });
    req.mfaUserId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "MFA token invalid/expired" });
  }
}
