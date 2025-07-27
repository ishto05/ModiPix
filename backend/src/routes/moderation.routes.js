import { Router } from "express";
import { upload } from "../middlewares/multer.config.middleware.js";
import { uploadImage } from "../controllers/uploads.controller.js";

const moderationRoutes = Router();

moderationRoutes.post("/uploads", upload.single("image"), uploadImage);

export default moderationRoutes;
