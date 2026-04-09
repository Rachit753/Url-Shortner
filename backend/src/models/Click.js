const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  urlId: {
    type: String,
    required: true,
    index: true,
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  referrer: {
    type: String,
  },
  location: {
    type: String,
    default: "Unknown",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

clickSchema.index({ urlId: 1, timestamp: -1 });

clickSchema.index({ urlId: 1, ip: 1, userAgent: 1 });

module.exports = mongoose.model("Click", clickSchema);