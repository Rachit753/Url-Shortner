const Url = require("../models/Url");
const { nanoid } = require("nanoid");
const redis = require("../config/redis");

exports.createShortUrlService = async (originalUrl, expiresAt) => {
  const shortId = nanoid(8);

  const url = await Url.create({
    originalUrl,
    shortId,
    expiresAt: expiresAt || null,
  });

  await redis.set(shortId, JSON.stringify(url), "EX", 3600);

  return {
    shortId,
    shortUrl: `${process.env.BASE_URL}/${shortId}`,
    originalUrl: url.originalUrl,
    expiresAt: url.expiresAt,
  };
};

exports.createCustomUrlService = async (originalUrl, customCode, expiresAt) => {
  const existing = await Url.findOne({ shortId: customCode });

  if (existing) {
    const error = new Error("Custom code already exists");
    error.statusCode = 400;
    throw error;
  }

  const url = await Url.create({
    originalUrl,
    shortId: customCode,
    expiresAt: expiresAt || null,
  });

  await redis.set(customCode, JSON.stringify(url), "EX", 3600);

  return {
    shortId: customCode,
    shortUrl: `${process.env.BASE_URL}/${customCode}`,
    originalUrl: url.originalUrl,
    expiresAt: url.expiresAt,
  };
};

exports.getUrlByShortId = async (shortId) => {

  const cached = await redis.get(shortId);

  if (cached) {
    return JSON.parse(cached);
  }

  const url = await Url.findOne({ shortId });

  if (!url) {
    const error = new Error("URL not found");
    error.statusCode = 404;
    throw error;
  }

  await redis.set(shortId, JSON.stringify(url), "EX", 3600);

  return url;
};

exports.incrementClicks = async (url) => {
  url.clicks += 1;
  await url.save();
};