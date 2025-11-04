const Url = require("../models/Url");
const Click = require("../models/Click");
const { nanoid } = require("nanoid");
const validator = require("validator");
const axios = require("axios");

// Random Short URL
exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl || !validator.isURL(originalUrl))
      return res.status(400).json({ error: "Valid Original URL required" });

    const shortId = nanoid(8);
    await Url.create({ originalUrl, shortId });

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({
      shortUrl: `${process.env.BASE_URL}/${shortId}`,
      originalUrl
    }, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Custom Short URL
exports.createCustomUrl = async (req, res) => {
  try {
    const { originalUrl, customCode } = req.body;
    if (!originalUrl || !customCode || !validator.isURL(originalUrl))
      return res.status(400).json({ error: "Valid Original URL and custom code required" });

    const existing = await Url.findOne({ shortId: customCode });
    if (existing) return res.status(400).json({ error: "This custom code is already taken" });

    await Url.create({ originalUrl, shortId: customCode });

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({
      shortUrl: `${process.env.BASE_URL}/${customCode}`,
      originalUrl
    }, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Redirect + save analytics

exports.redirectUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    if (!url) return res.status(404).json({ error: "URL not found" });

    // Increment total clicks
    url.clicks++;
    await url.save();

    // 🔧 Handle localhost IPs (replace ::1 with dummy IP for testing)
    let ip = req.ip;
    if (ip === "::1" || ip === "127.0.0.1") {
      ip = "8.8.8.8"; // Google's public IP (for testing)
    }

    const userAgent = req.get("user-agent");
    const referrer = req.get("referer") || "Direct";

    // 🌍 Get location info using free API
    let location = "Unknown";
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      if (response.data && response.data.city && response.data.country_name) {
        location = `${response.data.city}, ${response.data.country_name}`;
      } else if (response.data && response.data.country_name) {
        location = response.data.country_name;
      }
    } catch (geoError) {
      console.warn("🌐 Geo lookup failed:", geoError.message);
    }

    // 💾 Save click analytics
    await Click.create({
      urlId: url._id,
      ip,
      userAgent,
      referrer,
      location,
    });

    // Redirect to original URL
    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// Get Analytics for a short URL (Pretty JSON)
// Enhanced Analytics Summary (Phase 3)
exports.getAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    if (!url) return res.status(404).json({ error: "URL not found" });

    const clicks = await Click.find({ urlId: url._id });

    // 🧮 Total & Unique Visitors
    const totalClicks = clicks.length;
    const uniqueVisitors = new Set(clicks.map(c => `${c.ip}_${c.userAgent}`)).size;

    // 📅 Group by Date
    const dailyClicks = {};
    clicks.forEach(c => {
      const date = new Date(c.timestamp).toISOString().split("T")[0];
      dailyClicks[date] = (dailyClicks[date] || 0) + 1;
    });

    // 🌍 Group by Location
    const locationStats = {};
    clicks.forEach(c => {
      const loc = c.location || "Unknown";
      locationStats[loc] = (locationStats[loc] || 0) + 1;
    });

    // 💻 Group by Browser
    const browserStats = {};
    clicks.forEach(c => {
      let browser = "Other";
      if (c.userAgent.includes("Chrome")) browser = "Chrome";
      else if (c.userAgent.includes("Firefox")) browser = "Firefox";
      else if (c.userAgent.includes("Safari") && !c.userAgent.includes("Chrome")) browser = "Safari";
      else if (c.userAgent.includes("Edge")) browser = "Edge";
      browserStats[browser] = (browserStats[browser] || 0) + 1;
    });

    // 🧾 Final summary
    const analyticsSummary = {
      shortId: url.shortId,
      originalUrl: url.originalUrl,
      totalClicks,
      uniqueVisitors,
      dailyClicks,
      locationStats,
      browserStats,
      clicks, // optional: full click logs
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(analyticsSummary, null, 2)); // Pretty JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
