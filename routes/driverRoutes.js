const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * ✅ Upload driver profile image
 * POST /api/drivers/upload
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "auto-union-drivers" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({
            message: "Cloudinary upload failed",
            error: error.message || error,
          });
        }

        return res.json({ imageUrl: result.secure_url });
      },
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    return res.status(500).json({ message: "Upload failed" });
  }
});

/**
 * ✅ Test route
 * GET /api/drivers/register
 * (This is just to check API working. Your real register is POST.)
 */
router.get("/register", (req, res) => {
  res.send("Driver registration API is working");
});

/**
 * ✅ Public – show only approved drivers
 * GET /api/drivers
 */
router.get("/", async (req, res) => {
  try {
    // ✅ Correct: sort should be on the mongoose query, not on array
    const drivers = await Driver.find({
      status: "approved",
      isDeleted: { $ne: true }, // works even if old docs don't have isDeleted
    }).sort({ createdAt: -1 });

    return res.json(drivers);
  } catch (error) {
    console.error("Fetch approved drivers error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Driver self registration
 * POST /api/drivers/register
 */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      vehicleNumber,
      imageUrl,
      upiId,
      vehicleCategory,
    } = req.body;

    if (!name || !mobile || !vehicleNumber) {
      return res.status(400).json({
        message: "Name, Mobile and Vehicle Number are required",
      });
    }

    const newDriver = new Driver({
      name,
      mobile,
      email,
      vehicleNumber,
      imageUrl,
      upiId,
      vehicleCategory,
      status: "pending",
      isDeleted: false,
    });

    await newDriver.save();

    return res.status(201).json({
      message: "Registration successful. Waiting for admin approval.",
      driver: newDriver,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Driver login
 * POST /api/drivers/login
 */
router.post("/login", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile is required" });
    }

    const driver = await Driver.findOne({ mobile });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (driver.status !== "approved") {
      return res.status(403).json({ message: "Driver not approved yet" });
    }

    if (driver.isDeleted === true) {
      return res.status(403).json({ message: "Driver profile is deleted" });
    }

    return res.json({
      message: "Login successful",
      driverId: driver._id,
      driver,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get single driver profile
 * GET /api/drivers/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    return res.json(driver);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Update driver profile
 * PUT /api/drivers/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }, // ✅ removed extra comma
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    return res.json({
      message: "Profile updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
