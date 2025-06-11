import { Request, Response, NextFunction } from "express";
import { parseDocumentUseCase } from "../../application/usecases/parseDocumentUseCase";
import fs from "fs/promises";
import path from "path";

export const parseDocumentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
    };

    if (!files?.frontImage?.[0] || !files?.backImage?.[0]) {
      res
        .status(400)
        .json({ message: "Both front and back images are required" });
      return;
    }

    const result = await parseDocumentUseCase(files);

    res.status(200).json({ status: "success", parsedData: result });

    const cleanup = async () => {
      try {
        await fs.unlink(path.resolve(files.frontImage![0].path));
        await fs.unlink(path.resolve(files.backImage![0].path));
      } catch (err) {
        console.error("Error deleting uploaded files:", err);
      }
    };

    cleanup();
  } catch (err) {
    next(err);
  }
};
