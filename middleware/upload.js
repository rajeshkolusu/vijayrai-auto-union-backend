const multer = require("multer");
const path = require("path");

// ✅ Where to store files + unique name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // backend/uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname + "-" + Date.now() + ext;
    cb(null, safeName);
  },
});

// ✅ Allow only image files
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed (jpg, png, webp)"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // ✅ 2MB limit
});

module.exports = upload;
