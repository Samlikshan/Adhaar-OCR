import express, { Router } from "express";
import multer from "multer";
import path from "path";
import { parseDocumentController } from "../controllers/parserController";

const router: Router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads/");
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only image files (jpeg, png, jpg) are allowed"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
});

router.post(
  "/parse",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  parseDocumentController
);

export default router;
