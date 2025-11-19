import {
  getUserImages,
  getImageWithLogs,
  getImageStatus
} from "../services/imagepulling.service.js";

export const fetchAllImages = async (req, res) => {
  const userId = req.auth.userId;
  const result = await getUserImages(userId);
  return res.json(result);
};

export const fetchImageById = async (req, res) => {
  const userId = req.auth.userId;
  const { id } = req.params;

  const image = await getImageWithLogs(id, userId);
  if (!image) return res.status(404).json({ error: "Image not found" });

  return res.json(image);
};

export const fetchImageStatus = async (req, res) => {
  const userId = req.auth.userId;
  const { id } = req.params;

  const status = await getImageStatus(id, userId);
  if (!status) return res.status(404).json({ error: "Not found" });

  return res.json(status);
};
