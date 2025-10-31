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

// ====================================================
// 📚 CONTENT LIBRARY MANAGEMENT (Admin Panel)
// ====================================================

// 🧾 Get all contents (with instructor info including id for dropdowns)
export const getAllContents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.instructor_id,
        u.first_name,
        u.last_name,
        u.email AS instructor_email,
        c.created_at
      FROM contents c
      JOIN users u ON u.id = c.instructor_id
      ORDER BY c.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching contents:", err);
    res.status(500).json({ error: "Failed to fetch contents" });
  }
};


// ➕ Add new content
export const addContent = async (req, res) => {
  try {
    const { title, instructor_id } = req.body;

    if (!title || !instructor_id) {
      return res.status(400).json({ error: "Title and instructor are required" });
    }

    await pool.query(
      "INSERT INTO contents (title, instructor_id) VALUES ($1, $2)",
      [title, instructor_id]
    );

    res.status(201).json({ message: "Content created successfully" });
  } catch (err) {
    console.error("Error adding content:", err);
    res.status(500).json({ error: "Failed to create content" });
  }
};

// ❌ Delete content
export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM contents WHERE id = $1", [id]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Content not found" });

    res.json({ message: "Content deleted successfully" });
  } catch (err) {
    console.error("Error deleting content:", err);
    res.status(500).json({ error: "Failed to delete content" });
  }
};

// 📚 Get course titles for a specific instructor
export const getInstructorContents = async (req, res) => {
  const { id } = req.params; // instructor id

  try {
    const result = await pool.query(
      `SELECT id AS content_id, title AS content_title
       FROM contents
       WHERE instructor_id = $1
       ORDER BY id DESC`,
      [id]
    );

    res.json(result.rows); // returns [{ content_id, content_title }]
  } catch (err) {
    console.error("Error fetching instructor contents:", err);
    res.status(500).json({ error: "Failed to fetch instructor contents" });
  }
};

// Create module + enroll trainees
export const createModuleWithEnrollments = async (req, res) => {
  try {
    const {
      content_id,
      module_title,
      module_description,
      module_meta_description,
      video_url,
      trainee_ids
    } = req.body;

    // Files from multer
    const imageFile = req.files?.image?.[0] || null;
    const materialsFile = req.files?.materials?.[0] || null;
    const vrFile = req.files?.vr_content?.[0] || null;

    const imagePath = imageFile ? `/uploads/module_uploads/${imageFile.filename}` : null;
    const materialsPath = materialsFile ? `/uploads/module_uploads/${materialsFile.filename}` : null;
    const vrContentPath = vrFile ? `/uploads/module_uploads/${vrFile.filename}` : null;

    if (!content_id || !module_title) {
      return res.status(400).json({ error: "content_id and module_title are required" });
    }

    // Insert module record
    const insertModuleRes = await pool.query(
      `INSERT INTO modules
        (content_id, title, description, meta_description, image_path, video_url, materials_path, vr_content_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [
        content_id,
        module_title,
        module_description || null,
        module_meta_description || null,
        imagePath,
        video_url || null,
        materialsPath,
        vrContentPath
      ]
    );
    const moduleId = insertModuleRes.rows[0].id;

    // Parse trainee IDs array
    const traineeArr = typeof trainee_ids === "string"
      ? JSON.parse(trainee_ids)
      : (trainee_ids || []);

    if (Array.isArray(traineeArr) && traineeArr.length > 0) {
      const enrollPromises = traineeArr.map(tid => {
        return pool.query(
          `INSERT INTO module_enrollments (module_id, trainee_id)
           VALUES ($1,$2)`,
          [moduleId, tid]
        );
      });
      await Promise.all(enrollPromises);
    }

    res.status(201).json({ message: "Module created and trainees enrolled", moduleId });

  } catch (err) {
    console.error("Error in createModuleWithEnrollments:", err);
    res.status(500).json({ error: "Server error while creating module" });
  }
};

// Get modules + enrolled trainees for a specific content
export const getModulesWithEnrollmentsForContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const modulesRes = await pool.query(
      `SELECT
         m.id AS module_id,
         m.title AS module_title,
         m.description,
         m.meta_description,
         m.image_path,
         m.video_url,
         m.materials_path,
         m.vr_content_path,
         COALESCE(
           json_agg(
             json_build_object(
               'trainee_id', u.trainee_id,
               'first_name', u.first_name,
               'last_name', u.last_name
             )
           ) FILTER (WHERE u.id IS NOT NULL),
           '[]'
         ) AS enrolled_trainees
       FROM modules m
       LEFT JOIN module_enrollments e ON e.module_id = m.id
       LEFT JOIN users u ON u.id = e.trainee_id
       WHERE m.content_id = $1
       GROUP BY m.id
       ORDER BY m.id DESC`,
      [contentId]
    );

    res.json({ modules: modulesRes.rows });

  } catch (err) {
    console.error("Error in getModulesWithEnrollmentsForContent:", err);
    res.status(500).json({ error: "Failed to fetch modules" });
  }
};

// TO GET ALL TRAINEE FOR INSTRUCTOR DROPDOWN
export const getAllTrainees = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, trainee_id FROM users WHERE role='trainee'"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error in getAllTrainees:", err);
    res.status(500).json({ error: "Server error fetching trainees" });
  }
};


// GET /api/users/trainee/:id/enrollments
export const getTraineeEnrollments = async (req, res) => {
  const traineeId = req.params.id;

  try {
    const query = `
      SELECT 
        me.id AS enrollment_id,
        me.enrolled_at,
        m.id AS module_id,
        m.title AS module_title,
        m.description AS module_description,
        m.video_url,
        m.materials_path,
        m.vr_content_path,
        m.image_path,
        c.id AS course_id,
        c.title AS course_title
      FROM module_enrollments me
      JOIN modules m ON me.module_id = m.id
      JOIN contents c ON m.content_id = c.id
      WHERE me.trainee_id = $1
      ORDER BY me.enrolled_at DESC
    `;

    const { rows } = await pool.query(query, [traineeId]);

    return res.json(rows); // sends an array of enrollments
  } catch (err) {
    console.error("Error fetching trainee enrollments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
