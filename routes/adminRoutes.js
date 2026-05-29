const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const Driver = require("../models/Driver");
const adminAuth = require("../middleware/adminAuth");

/*
 POST /api/admin/login
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. See what the frontend browser sent to the server
    console.log("--- ADMIN LOGIN ATTEMPT ---");
    console.log("Frontend sent email:", email);
    console.log("Frontend sent password:", password);

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("Result: No admin found in database with that email.");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Database admin record found:", admin);

    // 2. See if bcryptjs matches them
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Bcryptjs match result:", isMatch);

    if (!isMatch) {
      console.log("Result: Password mismatch.");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("Result: Login Successful! Token generated.");
    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
 GET /api/admin/drivers/pending
*/
router.get("/drivers/pending", adminAuth, async (req, res) => {
  try {
    const drivers = await Driver.find({ status: "pending" });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
 GET /api/admin/drivers/approved
*/
router.get("/drivers/approved", adminAuth, async (req, res) => {
  try {
    const drivers = await Driver.find({ status: "approved" }).sort({
      approvedAt: -1,
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
 PUT /api/admin/drivers/approve/:id
*/
router.put("/drivers/approve/:id", adminAuth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedAt: new Date(),
        rejectedAt: null,
      },
      { new: true },
    );

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json({ message: "Driver approved", driver });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
 PUT /api/admin/drivers/reject/:id
*/
router.put("/drivers/reject/:id", adminAuth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectedAt: new Date(),
        approvedAt: null,
      },
      { new: true },
    );

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json({ message: "Driver rejected", driver });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
 DELETE /api/admin/drivers/:id
 ✅ PERMANENT DELETE (Hard delete)
*/
router.delete("/drivers/:id", adminAuth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    await Driver.findByIdAndDelete(req.params.id);

    return res.json({ message: "✅ Driver permanently deleted" });
  } catch (err) {
    console.error("Delete driver error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
