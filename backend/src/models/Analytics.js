const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true
  },
  ip: String,
  country: String,
  browser: String,
  device: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;