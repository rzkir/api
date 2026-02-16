import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  uploadMiddleware,
  uploadToImagekit,
} from "./controllers/uploadController";

dotenv.config();

export const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .filter(Boolean);

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Upload routes MUST run before express.json() so multer gets raw multipart body
const uploadWithErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  uploadMiddleware(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Upload gagal";
      const status = message.includes("Tipe file") || message.includes("limit") ? 400 : 500;
      return res.status(status).json({ message });
    }
    next();
  });
};
app.post("/upload", uploadWithErrorHandler, uploadToImagekit);
app.post("/api/upload", uploadWithErrorHandler, uploadToImagekit);

app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "API ImageKit jalan" });
});

app.get("/api/", (req: Request, res: Response) => {
  res.json({ message: "API ImageKit jalan" });
});

export default function handler(req: Request, res: Response): void {
  app(req, res);
}