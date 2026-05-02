import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "govledger_uploads",
    resource_type: "auto", // Automatically detect image, video, or raw (PDF/Doc)
    public_id: (req, file) => {
      const originalName = file.originalname.split(".")[0];
      return `${Date.now()}-${originalName}`;
    },
  },
});

function fileFilter(_req, file, cb) {
  const ALLOWED_MIMES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed: images, videos, PDF, Word docs.`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024, files: 5 }, // 20 MB per file, max 5 files
});

/** Convert a multer file object to a plain attachment record */
export function fileToAttachment(file, _baseUrl) {
  return {
    originalName: file.originalname,
    filename: file.filename || file.public_id,
    mimetype: file.mimetype,
    size: file.size,
    url: file.path, // Cloudinary returns the full URL in 'path'
  };
}
