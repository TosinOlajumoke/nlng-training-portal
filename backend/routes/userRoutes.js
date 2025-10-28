import express from "express";
import {
  getDashboardData,
  uploadProfilePicture,
  upload,
  getAllUsers,
  addUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// ====================================================
// 📊 Dashboard route
// ====================================================
router.get("/dashboard/:userId", getDashboardData);

// ====================================================
// 👥 USER MANAGEMENT ROUTES (Admin Panel)
// ====================================================
router.get("/", getAllUsers);       // Get all users
router.post("/", addUser);          // Add new user
router.delete("/:id", deleteUser);  // Delete user (except first admin)

// ====================================================
// 🖼️ Upload profile picture route
// ====================================================
router.post(
  "/upload-profile/:userId",
  (req, res, next) => {
    // Use multer to handle single file upload and catch errors
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

export default router;
