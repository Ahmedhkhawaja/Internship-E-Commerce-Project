const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
const { authAdmin, authUser } = require("../middleware/auth");

const router = express.Router();
// Admin-only image upload for product media.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
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

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: "Cloudinary is not configured" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "gym-store", resource_type: "image" },
      (uploadErr, result) => {
        if (uploadErr) {
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }
        return res.json({ imageUrl: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  });
});

module.exports = router;
