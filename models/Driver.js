const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    vehicleCategory: {
      type: String,
      required: true,
      enum: ["Passenger", "Goods Carrier"], // Restricts values to only these two options
      default: "Passenger",
    },
    imageUrl: {
      type: String,
    },
    upiId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },

  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Driver", driverSchema);
