import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connect } from "mongoose";

import userRoutes from "./routes/userRoutes.js";
import coffeeSampleRoutes from "./routes/coffeeSampleRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection
connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/coffee-samples", coffeeSampleRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Serve frontend build
const clientPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(clientPath));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
