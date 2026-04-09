const validator = require("validator");

const validateUrl = (req, res, next) => {
  let { originalUrl, customCode } = req.body;

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

  if (customCode) {
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(customCode)) {
      return res.status(400).json({
        message: "Custom code must be 3-20 characters (letters, numbers, - or _)",
      });
    }
  }

  next();
};

module.exports = validateUrl;