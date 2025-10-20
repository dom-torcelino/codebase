// src/config/envVars.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force-load backend/.env no matter the CWD
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(name) {
  const v = process.env[name];
  if (!v) {
    // Helpful log so you can see which one is missing
    console.error("Missing env var:", name);
    throw new Error(`Missing env var: ${name}`);
  }
  return v;
}

export const envVars = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 4000),
  MONGO_URI: required("MONGO_URI"),
  CORS_ORIGIN: (process.env.CORS_ORIGIN || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean),
  APP_NAME: process.env.APP_NAME || "APP",
  JWT_SECRET: required("JWT_SECRET"),
  ACCESS_TOKEN_TTL: Number(process.env.ACCESS_TOKEN_TTL || 86400),
  MFA_TOKEN_TTL: Number(process.env.MFA_TOKEN_TTL || 300),
  COOKIE_NAME: process.env.COOKIE_NAME || "access_token",
};
