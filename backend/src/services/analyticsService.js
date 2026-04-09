const Click = require("../models/Click");

exports.saveClickAnalytics = async ({ urlId, ip, userAgent, referrer, location }) => {
  await Click.create({
    urlId,
    ip,
    userAgent,
    referrer,
    location,
  });
};

exports.getAnalyticsData = async (url, clicks) => {
  const totalClicks = clicks.length;
  const uniqueVisitors = new Set(clicks.map(c => `${c.ip}_${c.userAgent}`)).size;

  const dailyClicks = {};
  clicks.forEach(c => {
    const date = new Date(c.timestamp).toISOString().split("T")[0];
    dailyClicks[date] = (dailyClicks[date] || 0) + 1;
  });

  const locationStats = {};
  clicks.forEach(c => {
    const loc = c.location || "Unknown";
    locationStats[loc] = (locationStats[loc] || 0) + 1;
  });

  const browserStats = {};
  clicks.forEach(c => {
    let browser = "Other";
    if (c.userAgent.includes("Chrome")) browser = "Chrome";
    else if (c.userAgent.includes("Firefox")) browser = "Firefox";
    else if (c.userAgent.includes("Safari") && !c.userAgent.includes("Chrome")) browser = "Safari";
    else if (c.userAgent.includes("Edge")) browser = "Edge";

    browserStats[browser] = (browserStats[browser] || 0) + 1;
  });

  return {
    shortId: url.shortId,
    originalUrl: url.originalUrl,
    totalClicks,
    uniqueVisitors,
    dailyClicks,
    locationStats,
    browserStats,
    clicks,
  };
};