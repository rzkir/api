import { Request, Response } from "express";
import multer from "multer";
import { getImagekit } from "../imgkit/imagekit";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function sanitizeFileName(name: string): string {
  const ext = name.replace(/^.*\.([a-zA-Z0-9]+)$/, "$1").toLowerCase() || "jpg";
  const safe = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  return safe;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipe file tidak didukung. Gunakan: ${ALLOWED_MIMES.join(", ")}`));
    }
  },
});

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

    const safeFileName = sanitizeFileName(file.originalname);
    const result = await getImagekit().upload({
      file: file.buffer,
      fileName: safeFileName,
      folder: "/uploads",
    });

    res.status(200).json({
      url: result.url,
      message: "Upload berhasil",
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error upload ke ImageKit:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak diketahui";

    // Multer validation (e.g. file type) returns 400
    const status = message.includes("Tipe file") || message.includes("File too large") ? 400 : 500;
    res.status(status).json({
      message: "Terjadi kesalahan saat upload",
      error: message,
    });
  }
};