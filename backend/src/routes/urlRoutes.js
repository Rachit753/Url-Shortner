const express = require("express");
const router = express.Router();

const {
  createShortUrl,
  createCustomUrl,
  redirectUrl,
  getAnalytics,
  exportCSV
} = require("../controllers/urlController");

const validateUrl = require("../middleware/validateUrl");

router.post("/shorten", validateUrl, createShortUrl);
router.post("/custom", validateUrl, createCustomUrl);

router.get("/:shortId/analytics", getAnalytics);
router.get("/:shortId", redirectUrl);

router.get("/:shortId/export", exportCSV);

module.exports = router;