// userRoutes.js
import express from "express";
import {
  getDashboardData,
  uploadProfilePicture,
  upload,
  getAllUsers,
  addUser,
  deleteUser,
  addContent,
  deleteContent,
  getInstructorContents,
  createModuleWithEnrollments,
  getModulesWithEnrollmentsForContent,
  getAllTrainees,
  getTraineeEnrollments,
} from "../controllers/userController.js";
import { pool } from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ====================================================
// 📊 DASHBOARD ROUTE
// ====================================================
router.get("/dashboard/:userId", getDashboardData);

// ====================================================
// 👥 USER MANAGEMENT ROUTES (Admin Panel)
// ====================================================
router.get("/", getAllUsers);
router.post("/", addUser);
router.delete("/:id", deleteUser);

// ====================================================
// 🖼️ UPLOAD PROFILE PICTURE ROUTE
// ====================================================
router.post(
  "/upload-profile/:userId",
  (req, res, next) => {
    upload.single("profile")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({
          message: "Error uploading file",
          error: err.message,
        });
      }
      next();
    });
  },
  uploadProfilePicture
);

// ====================================================
// GET all instructors (for admin dropdowns)
// ====================================================
router.get("/instructors", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, role FROM users WHERE role='instructor'"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructors:", err);
    res.status(500).json({ error: "Failed to fetch instructors" });
  }
});

// ====================================================
// GET all trainees (for instructors dropdowns)
// ====================================================
router.get("/trainees", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, trainee_id FROM users WHERE role='trainee'"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching trainees:", err);
    res.status(500).json({ error: "Failed to fetch trainees" });
  }
});

router.get("/trainees", getAllTrainees);

// ====================================================
// GET user info by email (optional, for login)
// ====================================================
router.get("/by-email/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, role FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user by email:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ====================================================
// 📚 CONTENT LIBRARY ROUTES (Admin Panel)
// ====================================================
router.get("/contents", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.title,
             u.id AS instructor_id,
             u.first_name,
             u.last_name,
             u.email
      FROM contents c
      JOIN users u ON c.instructor_id = u.id
      ORDER BY c.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching contents:", err);
    res.status(500).json({ error: "Failed to fetch contents" });
  }
});

router.post("/contents", addContent);
router.delete("/contents/:id", deleteContent);

// ====================================================
// 🎓 INSTRUCTOR‑SPECIFIC ROUTE
router.get("/instructor/:id/contents", getInstructorContents);

// ====================================================
// 🧩 MODULE + ENROLLMENTS Routes
// Configure multer for module uploads
const moduleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve("uploads", "module_uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `module_${Date.now()}${ext}`);
  }
});
const moduleUpload = multer({ storage: moduleStorage });

// POST create module + enroll trainees
router.post(
  "/modules/create",
  moduleUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "materials", maxCount: 1 },
    { name: "vr_content", maxCount: 1 }
  ]),
  createModuleWithEnrollments
);

// GET modules + enrollments for a given content
router.get("/modules/content/:contentId", getModulesWithEnrollmentsForContent);

// ====================================================

// Trainee enrollments
router.get("/trainee/:id/enrollments", getTraineeEnrollments);


export default router;
