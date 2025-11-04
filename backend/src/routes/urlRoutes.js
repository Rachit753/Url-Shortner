const express = require("express");
const router = express.Router();
const { createShortUrl, createCustomUrl, redirectUrl, getAnalytics } = require("../controllers/urlController");

// Random Short URL
router.post("/shorten", createShortUrl);

// Custom Short URL
router.post("/custom", createCustomUrl);

// Redirect to original URL
router.get("/:shortId", redirectUrl);

// Analytics for a short URL
router.get("/:shortId/analytics", getAnalytics);

module.exports = router;
