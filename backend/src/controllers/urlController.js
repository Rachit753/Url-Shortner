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
  const { originalUrl } = req.body;

  const result = await createShortUrlService(originalUrl);
  res.json(result);
});

exports.createCustomUrl = asyncHandler(async (req, res) => {
  const { originalUrl, customCode } = req.body;

  if (!customCode) {
    return res.status(400).json({ message: "Custom code required" });
  }

  const result = await createCustomUrlService(originalUrl, customCode);
  res.json(result);
});

exports.redirectUrl = asyncHandler(async (req, res) => {
  const url = await getUrlByShortId(req.params.shortId);

  await incrementClicks(url);

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

  const clicks = await Click.find({ urlId: url._id });

  const data = await getAnalyticsData(url, clicks);

  res.json(data);
});