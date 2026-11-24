import multer from "multer";

export const uploadProfileImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
      callback(Object.assign(new Error("Solo se aceptan imágenes PNG, JPEG o WebP."), { statusCode: 400 }));
      return;
    }
    callback(null, true);
  },
});
