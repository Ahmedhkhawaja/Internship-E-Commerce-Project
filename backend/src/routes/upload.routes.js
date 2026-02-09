const express = require("express");
const multer = require("multer");
const path = require("path");
const { authAdmin, authUser } = require("../middleware/auth");

const router = express.Router();
// Admin-only image upload for product media.

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new Error("Only jpg, jpeg, png, and webp images are allowed"));
    }
    return cb(null, true);
  },
});

router.post("/", authUser, authAdmin, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Image upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    return res.json({ imageUrl: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;
