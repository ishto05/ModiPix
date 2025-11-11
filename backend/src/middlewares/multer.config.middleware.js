import multer from "multer";
import { validateFileExtension, getAllowedExtensions } from "../utils/fileValidator.js";

// Use memory storage for direct upload to Supabase
const storage = multer.memoryStorage();

// File filter to allow only images (basic extension check)
// Note: Actual content validation happens in the controller using magic numbers
const fileFilter = (req, file, cb) => {
  // Basic extension validation
  if (validateFileExtension(file.originalname)) {
    cb(null, true);
  } else {
    const allowedExts = getAllowedExtensions().join(', ');
    cb(new Error(`Only ${allowedExts} files are allowed`));
  }
};

// Multer instance with enhanced error handling
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Only one file per request
    fieldSize: 1024 * 1024, // 1MB max field size
  },
  // Handle multer errors
  onError: (err, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      err.message = 'File too large. Maximum size is 5MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      err.message = 'Too many files. Only one file allowed per request.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      err.message = 'Unexpected file field. Use "image" field name.';
    }
    next(err);
  }
});
