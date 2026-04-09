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

  await redis.set(
    shortId,
    JSON.stringify({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortId: url.shortId,
      expiresAt: url.expiresAt,
      clicks: url.clicks || 0 
    }),
    "EX",
    3600
  );

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

  await redis.set(
    customCode,
    JSON.stringify({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortId: url.shortId,
      expiresAt: url.expiresAt,
      clicks: url.clicks || 0 
    }),
    "EX",
    3600
  );

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
  const parsed = JSON.parse(cached);
  parsed.clicks = parsed.clicks || 0;
  return parsed;
}

  const url = await Url.findOne({ shortId });

  if (!url) {
    const error = new Error("URL not found");
    error.statusCode = 404;
    throw error;
  }

  await redis.set(
    shortId,
    JSON.stringify({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortId: url.shortId,
      expiresAt: url.expiresAt,
      clicks: url.clicks || 0
    }),
    "EX",
    3600
  );

  return url;
};

exports.incrementClicks = async (url) => {
  await Url.updateOne(
    { _id: url._id },
    { $inc: { clicks: 1 } }
  );

  const updatedUrl = await Url.findById(url._id);

  await redis.set(
    updatedUrl.shortId,
    JSON.stringify({
      _id: updatedUrl._id,
      originalUrl: updatedUrl.originalUrl,
      shortId: updatedUrl.shortId,
      expiresAt: updatedUrl.expiresAt,
      clicks: updatedUrl.clicks
    }),
    "EX",
    3600
  );
};