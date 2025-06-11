import express from "express";
import path from "path";
import cors from "cors";
import dotenv, { config } from "dotenv";
import fs from "fs";
dotenv.config();
// Import OCR routes
import ocrRoutes from "./routes/ocrRoutes";
import { errorHandler } from "../middlewares/errorHandler";

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "*";
app.use(cors({ origin: CLIENT_URL }));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const uploadDir = path.join(__dirname, "..", "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/api/ocr", ocrRoutes);

app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || "5000", 10);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
