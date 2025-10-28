// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const { Pool } = pkg;

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
// 🗄️ PostgreSQL Connection
// ====================================================
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("❌ Database connection error:", err.message));

// ====================================================
// 🧩 Middleware Setup
// ====================================================
const allowedOrigins = [
  "http://localhost:5173", // React dev server
  process.env.FRONTEND_URL, // Production frontend
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
// 🌐 Serve Static Files
// ====================================================
// Serve uploads directory (profile pictures, etc.)
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/uploads/profile_pics", express.static(path.resolve("uploads/profile_pics")));

// ====================================================
// 🔐 API Routes
// ====================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ====================================================
// 🌟 Base Route
// ====================================================
app.get("/", (req, res) => {
  res.send("✅ NLNG LMS Backend Server is Running 🚀");
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
