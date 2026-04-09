require("dotenv").config();

const clickQueue = require("../queues/clickQueue");
const { saveClickAnalytics } = require("../services/analyticsService");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

connectDB();

clickQueue.process(async (job) => {

  const { urlId, ip, userAgent, referrer, location } = job.data;

  try {
    await saveClickAnalytics({
      urlId: new mongoose.Types.ObjectId(urlId),
      ip,
      userAgent,
      referrer,
      location,
    });

    console.log("Click saved to DB");
  } catch (err) {
    console.error("Error saving click:", err.message);
  }
});

console.log("Click Worker running...");