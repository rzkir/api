import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import ImageKit from "imagekit";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalDev = origin?.startsWith("http://localhost:3000");

      // Izinkan:
      // - request tanpa origin (server-to-server)
      // - semua origin jika ALLOWED_ORIGINS kosong
      // - origin yang ada di ALLOWED_ORIGINS
      // - selalu izinkan localhost:3000 untuk development
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        isLocalDev
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Pastikan preflight OPTIONS juga diproses oleh CORS
app.options("*", cors());

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

function getImagekit() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      "ImageKit env vars harus di-set di Vercel Environment Variables"
    );
  }
  return new ImageKit({ publicKey, privateKey, urlEndpoint });
}

app.get("/api", (_req: Request, res: Response) => {
  res.json({ message: "API ImageKit jalan" });
});

app.get("/api/", (_req: Request, res: Response) => {
  res.json({ message: "API ImageKit jalan" });
});

const handleUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiSecret = process.env.API_SECRET;
    const clientSecret =
      (req.headers["x-api-secret"] as string | undefined) ||
      (req.headers["authorization"] as string | undefined);

    if (!apiSecret) {
      res
        .status(500)
        .json({ message: "API_SECRET belum dikonfigurasi di server" });
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

    const imagekit = getImagekit();
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/uploads",
    });

    res.status(200).json({
      message: "Upload berhasil",
      data: result,
    });
  } catch (error: unknown) {
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

// Endpoint yang akan dipanggil dari frontend:
// - /upload  (sesuai NUXT_PUBLIC_API_URL sekarang)
// - /api/upload (kalau mau pakai prefix /api)
app.post("/upload", upload.single("file"), handleUpload);
app.post("/api/upload", upload.single("file"), handleUpload);

export default function handler(
  req: express.Request,
  res: express.Response
): void {
  app(req, res);
}
