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

const clickQueue = require("../queues/clickQueue");

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

  const location = "Unknown";

  clickQueue.add({
    urlId: url._id,
    ip,
    userAgent,
    referrer,
    location,
  });

  return res.redirect(url.originalUrl);
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const url = await getUrlByShortId(req.params.shortId);

  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    browser: req.query.browser,
  };

  const data = await getAnalyticsData(url, filters);

  res.setHeader("Cache-Control", "no-store");
  res.json(data);
});