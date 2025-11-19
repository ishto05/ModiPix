import { Router } from "express";
import { clerkMiddleware } from "@clerk/express";

import {
  fetchAllImages,
  fetchImageById,
  fetchImageStatus
} from "../controllers/imagePulling.controller.js";

const imagepulling = Router();

// GET /images → all images for user
imagepulling.get("/allImages", clerkMiddleware(), fetchAllImages);

// GET /images/:id → full details + logs
imagepulling.get("/userImage/:id", clerkMiddleware(), fetchImageById);

// GET /images/:id/status → only status
imagepulling.get("/image/:id/status", clerkMiddleware(), fetchImageStatus);

export default imagepulling;
