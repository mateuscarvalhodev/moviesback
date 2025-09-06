import multer from "multer";

const storage = multer.memoryStorage();

function imageFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image files are allowed"));
}

export const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: "poster", maxCount: 1 },
  { name: "backdrop", maxCount: 1 },
]);
