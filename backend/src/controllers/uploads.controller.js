import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

export const uploadImage = async (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, "../../uploads", req.file.filename);

    const form = new FormData();
    form.append("image", fs.createReadStream(filePath));

    const response = await axios.post("http://localhost:8000/moderate", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return res.status(200).json({
      status: "success",
      moderationResult: response.data,
    });
  } catch (error) {
    console.error("Error calling moderation microservice:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Moderation service failed.",
    });
  }
};
