import express from "express";
import multer from "multer";
import { uploadToS3, deleteFromS3 } from "../services/s3";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Handle single file upload
router.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const result = await uploadToS3(req.file);
    // Return array format to maintain compatibility with existing code
    res.json([{ url: result.url, key: result.key }]);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Handle file deletion
router.delete("/api/upload/:key", async (req, res) => {
  try {
    const { key } = req.params;
    await deleteFromS3(key);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;