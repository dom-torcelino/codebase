import { User } from "../models/User.js";
import { envVars } from "../config/envVars.js";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

function signAccessToken(userId) {
  return jwt.sign({ type: "ACCESS" }, envVars.JWT_SECRET, { subject: userId, expiresIn: envVars.ACCESS_TOKEN_TTL });
}
function signMfaPendingToken(userId) {
  return jwt.sign({ type: "MFA_PENDING" }, envVars.JWT_SECRET, { subject: userId, expiresIn: envVars.MFA_TOKEN_TTL });
}
function setAuthCookie(res, token) {
  const isProd = envVars.NODE_ENV === "production";
  res.cookie(envVars.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: envVars.ACCESS_TOKEN_TTL * 1000,
    path: "/"
  });
}

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email & password required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });
    const user = await User.create({ email, password, name });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (e) {
    return res.status(500).json({ message: "Register failed", error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password +mfa.secret");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (user.mfa?.enabled && user.mfa.secret) {
      const tempToken = signMfaPendingToken(user.id);
      return res.json({ mfaRequired: true, tempToken });
    }

    const access = signAccessToken(user.id);
    setAuthCookie(res, access);
    return res.json({ mfaRequired: false, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    return res.status(500).json({ message: "Login failed", error: e.message });
  }
}

export async function validateMfa(req, res) {
  try {
    const { code } = req.body;
    const userId = req.mfaUserId;
    const user = await User.findById(userId).select("+mfa.secret");
    if (!user || !user.mfa?.secret) return res.status(400).json({ message: "MFA not set" });

    const ok = speakeasy.totp.verify({
      secret: user.mfa.secret,
      encoding: "base32",
      token: code,
      window: 1
    });
    if (!ok) return res.status(401).json({ message: "Invalid code" });

    user.mfa.lastVerifiedAt = new Date();
    await user.save();

    const access = signAccessToken(user.id);
    setAuthCookie(res, access);
    return res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    return res.status(500).json({ message: "MFA validation failed", error: e.message });
  }
}

export async function generateMfa(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${envVars.APP_NAME} (${user.email})`
    });

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);
    return res.json({ base32: secret.base32, otpauthUrl: secret.otpauth_url, qrDataUrl });
  } catch (e) {
    return res.status(500).json({ message: "MFA generation failed", error: e.message });
  }
}

export async function verifyMfa(req, res) {
  try {
    const userId = req.user.id;
    const { base32, code } = req.body;
    if (!base32 || !code) return res.status(400).json({ message: "base32 and code required" });

    const ok = speakeasy.totp.verify({
      secret: base32, encoding: "base32", token: code, window: 1
    });
    if (!ok) return res.status(400).json({ message: "Code invalid" });

    await User.findByIdAndUpdate(userId, {
      $set: { "mfa.enabled": true, "mfa.secret": base32, "mfa.lastVerifiedAt": new Date() }
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: "MFA verify failed", error: e.message });
  }
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  return res.json({ id: user.id, email: user.email, name: user.name, mfaEnabled: !!user.mfa?.enabled });
}

export async function logout(req, res) {
  res.clearCookie(envVars.COOKIE_NAME, { path: "/" });
  return res.json({ ok: true });
}
