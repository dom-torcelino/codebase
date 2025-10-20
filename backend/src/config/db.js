import mongoose from "mongoose";
import { envVars } from "./envVars.js";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(envVars.MONGO_URI);
  console.log("Mongo connected");
}