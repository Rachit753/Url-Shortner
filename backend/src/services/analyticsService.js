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

exports.getAnalyticsData = async (url) => {
  const urlId = url._id;

  const totalClicks = await Click.countDocuments({ urlId });

  const uniqueVisitorsAgg = await Click.aggregate([
    { $match: { urlId } },
    {
      $group: {
        _id: { ip: "$ip", userAgent: "$userAgent" }
      }
    },
    { $count: "uniqueVisitors" }
  ]);

  const uniqueVisitors = uniqueVisitorsAgg[0]?.uniqueVisitors || 0;

  const dailyClicksAgg = await Click.aggregate([
    { $match: { urlId } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  const dailyClicks = {};
  dailyClicksAgg.forEach(d => {
    dailyClicks[d._id] = d.count;
  });

  const locationAgg = await Click.aggregate([
    { $match: { urlId } },
    {
      $group: {
        _id: "$location",
        count: { $sum: 1 }
      }
    }
  ]);

  const locationStats = {};
  locationAgg.forEach(l => {
    locationStats[l._id || "Unknown"] = l.count;
  });

  const browserAgg = await Click.aggregate([
    { $match: { urlId } },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: "$userAgent", regex: "Chrome" } }, then: "Chrome" },
              { case: { $regexMatch: { input: "$userAgent", regex: "Firefox" } }, then: "Firefox" },
              { case: { $regexMatch: { input: "$userAgent", regex: "Safari" } }, then: "Safari" },
              { case: { $regexMatch: { input: "$userAgent", regex: "Edge" } }, then: "Edge" }
            ],
            default: "Other"
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  const browserStats = {};
  browserAgg.forEach(b => {
    browserStats[b._id] = b.count;
  });

  return {
    shortId: url.shortId,
    originalUrl: url.originalUrl,
    totalClicks,
    uniqueVisitors,
    dailyClicks,
    locationStats,
    browserStats
  };
};