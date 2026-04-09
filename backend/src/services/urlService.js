const Url = require("../models/Url");
const { nanoid } = require("nanoid");

exports.createShortUrlService = async (originalUrl) => {
  const shortId = nanoid(8);

  const url = await Url.create({
    originalUrl,
    shortId,
  });

  return {
    shortId,
    shortUrl: `${process.env.BASE_URL}/${shortId}`,
    originalUrl: url.originalUrl,
  };
};

exports.createCustomUrlService = async (originalUrl, customCode) => {
  const existing = await Url.findOne({ shortId: customCode });

  if (existing) {
    const error = new Error("Custom code already exists");
    error.statusCode = 400;
    throw error;
  }

  const url = await Url.create({
    originalUrl,
    shortId: customCode,
  });

  return {
    shortId: customCode,
    shortUrl: `${process.env.BASE_URL}/${customCode}`,
    originalUrl: url.originalUrl,
  };
};

exports.getUrlByShortId = async (shortId) => {
  const url = await Url.findOne({ shortId });

  if (!url) {
    const error = new Error("URL not found");
    error.statusCode = 404;
    throw error;
  }

  return url;
};

exports.incrementClicks = async (url) => {
  url.clicks += 1;
  await url.save();
};