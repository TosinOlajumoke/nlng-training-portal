// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { pool } from "./config/db.js"; // <- use the single pool from config

// ====================================================
// 🔧 Load environment variables
// ====================================================
dotenv.config();

// ====================================================
// 🏗️ Initialize Express
// ====================================================
const app = express();
const port = process.env.PORT || 5000;

// ====================================================
// 🧩 Middleware Setup
// ====================================================
const allowedOrigins = [
  "http://localhost:5173", // React dev server
  process.env.FRONTEND_URL, // Production frontend (if set)
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================================================
// 🧾 Request Logging Middleware (added for debugging)
// ====================================================
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.originalUrl}`);
  next();
});

// ====================================================
// Serve uploads folder statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ====================================================
// 🔐 API Routes
// ====================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ====================================================
// 🌟 Base Route — optionally verify DB ping
// ====================================================
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`✅ NLNG LMS Backend Server is Running 🚀 — DB Time: ${result.rows[0].now}`);
  } catch (error) {
    console.error("❌ Database connection error on GET / :", error.message);
    res.status(500).send("Database error");
  }
});

// ====================================================
// ⚠️ Error Handling Middleware
// ====================================================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal server error.";
  res.status(status).json({ error: message });
});

// ====================================================
// 🏁 Start Server
// ====================================================
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
