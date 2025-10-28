import { pool } from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

// ====================================================
// 🔧 Multer configuration for profile uploads
// ====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve("uploads/profile_pics");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.params.userId}_${Date.now()}${ext}`);
  },
});

export const upload = multer({ storage });

// ====================================================
// 📊 Dashboard Data
// ====================================================
export const getDashboardData = async (req, res) => {
  const { userId } = req.params;

  try {
    const userRes = await pool.query(
      `SELECT id, first_name, last_name, email, role, title, trainee_id, profile_picture, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rowCount === 0)
      return res.status(404).json({ message: "User not found" });

    let user = userRes.rows[0];

    // Ensure profile_picture is full URL
    if (user.profile_picture && !user.profile_picture.startsWith("http")) {
      user.profile_picture = `${req.protocol}://${req.get("host")}${user.profile_picture}`;
    }

    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE role = 'admin') AS total_admins,
        COUNT(*) FILTER (WHERE role = 'instructor') AS total_instructors,
        COUNT(*) FILTER (WHERE role = 'trainee') AS total_trainees,
        COUNT(*) AS total_users
      FROM users;
    `);

    res.json({ user, stats: statsRes.rows[0] });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

// ====================================================
// 🖼️ Upload Profile Picture
// ====================================================
export const uploadProfilePicture = async (req, res) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const userRes = await pool.query(
      "SELECT profile_picture FROM users WHERE id = $1",
      [userId]
    );

    if (userRes.rowCount === 0)
      return res.status(404).json({ message: "User not found" });

    const currentPicture = userRes.rows[0].profile_picture;
    const imageUrl = `/uploads/profile_pics/${req.file.filename}`;

    await pool.query(
      "UPDATE users SET profile_picture = $1 WHERE id = $2",
      [imageUrl, userId]
    );

    // Delete old picture if it's not the default avatar
    const defaultAvatarPath = "/uploads/default/default-avatar.png";
    if (currentPicture && currentPicture !== defaultAvatarPath) {
      const oldFilePath = path.join(process.cwd(), currentPicture);
      fs.unlink(oldFilePath, (err) => {
        if (err) console.warn("Failed to delete old profile picture:", err.message);
        else console.log("Old profile picture deleted:", oldFilePath);
      });
    }

    // Return full URL with cache-busting
    const fullUrl = `${req.protocol}://${req.get("host")}${imageUrl}?t=${Date.now()}`;
    res.json({ message: "Profile picture uploaded", imageUrl: fullUrl });
  } catch (err) {
    console.error("Profile upload error:", err);
    res.status(500).json({ message: "Error uploading profile picture" });
  }
};

// ====================================================
// 👥 USER MANAGEMENT (Admin Panel)
// ====================================================

// 📋 Get all users
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, title, trainee_id, created_at 
       FROM users ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ➕ Add new user
export const addUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, title, trainee_id } = req.body;

    // Check if email already exists
    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rowCount > 0)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertRes = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, title, trainee_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, last_name, email, role, title, trainee_id, created_at`,
      [first_name, last_name, email, hashedPassword, role, title || null, trainee_id || null]
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// ❌ Delete user (except first admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find first admin
    const firstAdminRes = await pool.query(
      `SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1`
    );

    if (firstAdminRes.rowCount > 0 && firstAdminRes.rows[0].id == id) {
      return res.status(403).json({ error: "Cannot delete the first admin" });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};