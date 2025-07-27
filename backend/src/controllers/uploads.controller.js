export const uploadImage = (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ status: "falied", error: "No image file uploaded!" });
  }

  return res.status(200).json({
    message: "✅ Image uploaded successfully.",
    filePath: `uploads/${req.file.filename}`,
  });
};
