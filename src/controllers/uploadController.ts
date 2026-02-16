import { Request, Response } from "express";
import multer from "multer";
import { getImagekit } from "../imgkit/imagekit";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single("file");

export const uploadToImagekit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const apiSecret = process.env.API_SECRET;
    const clientSecret =
      (req.headers["x-api-secret"] as string | undefined) ||
      (req.headers["authorization"] as string | undefined);

    if (!apiSecret) {
      res.status(500).json({ message: "API_SECRET belum dikonfigurasi di server" });
      return;
    }

    if (!clientSecret || clientSecret !== apiSecret) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "File tidak ditemukan" });
      return;
    }

    const result = await getImagekit().upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/uploads",
    });

    res.status(200).json({
      message: "Upload berhasil",
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error upload ke ImageKit:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak diketahui";

    res.status(500).json({
      message: "Terjadi kesalahan saat upload",
      error: message,
    });
  }
};