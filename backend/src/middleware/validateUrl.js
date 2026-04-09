const validator = require("validator");

const validateUrl = (req, res, next) => {
  let { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ message: "URL is required" });
  }

  if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
    originalUrl = "https://" + originalUrl;
    req.body.originalUrl = originalUrl;
  }

  if (!validator.isURL(originalUrl)) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  next();
};

module.exports = validateUrl;