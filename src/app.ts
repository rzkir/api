import express, { Request, Response } from "express";
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

app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "API ImageKit jalan" });
});

app.get("/api/", (req: Request, res: Response) => {
  res.json({ message: "API ImageKit jalan" });
});

app.post("/api/upload", uploadMiddleware, uploadToImagekit);