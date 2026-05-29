const cloudinary = require("cloudinary").v2;

// Temporary diagnostic check
console.log("Cloudinary Config Check:", {
  has_name: !!process.env.CLOUDINARY_CLOUD_NAME,
  has_key: !!process.env.CLOUDINARY_API_KEY,
  has_secret: !!process.env.CLOUDINARY_API_SECRET,
  secret_length: process.env.CLOUDINARY_API_SECRET
    ? process.env.CLOUDINARY_API_SECRET.length
    : 0,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
