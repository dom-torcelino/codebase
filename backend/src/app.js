// app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { envVars } from "./config/envVars.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.set("trust proxy", true);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: envVars.CORS_ORIGIN,
    credentials: true,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true, service: envVars.APP_NAME }));

app.use("/api/auth", authRoutes);

export default app;
