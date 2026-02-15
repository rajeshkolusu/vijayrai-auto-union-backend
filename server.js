const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); // ✅ ADDED
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

/* =====================================================
   ✅ MAKE UPLOADS FOLDER PUBLIC
   ===================================================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =====================================================
   ROUTES
   ===================================================== */
app.use("/api/drivers", require("./routes/driverRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

/* =====================================================
   SERVER
   ===================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
