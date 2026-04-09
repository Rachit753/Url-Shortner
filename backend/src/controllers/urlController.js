const asyncHandler = require("../middleware/asyncHandler");
const {
  createShortUrlService,
  createCustomUrlService,
  getUrlByShortId,
  incrementClicks,
} = require("../services/urlService");

const {
  saveClickAnalytics,
  getAnalyticsData,
} = require("../services/analyticsService");

const Click = require("../models/Click");
const axios = require("axios");

exports.createShortUrl = asyncHandler(async (req, res) => {
  const { originalUrl, expiresAt } = req.body;

  const result = await createShortUrlService(originalUrl, expiresAt);
  res.json(result);
});

exports.createCustomUrl = asyncHandler(async (req, res) => {
  const { originalUrl, customCode, expiresAt } = req.body;

  if (!customCode) {
    return res.status(400).json({ message: "Custom code required" });
  }

  const result = await createCustomUrlService(originalUrl, customCode, expiresAt);
  res.json(result);
});

exports.redirectUrl = asyncHandler(async (req, res) => {
  const url = await getUrlByShortId(req.params.shortId);

  if (url.expiresAt && url.expiresAt < new Date()) {
  return res.status(410).json({ message: "Link expired" });
}

  incrementClicks(url);

  let ip = req.ip;
  const userAgent = req.get("user-agent");
  const referrer = req.get("referer") || "Direct";

  let location = "Unknown";

  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    if (response.data?.country_name) {
      location = response.data.country_name;
    }
  } catch {}

  process.nextTick(() => {
    saveClickAnalytics({
      urlId: url._id,
      ip,
      userAgent,
      referrer,
      location,
    });
  });

  return res.redirect(url.originalUrl);
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const url = await getUrlByShortId(req.params.shortId);

  const data = await getAnalyticsData(url);

  res.json(data);
});