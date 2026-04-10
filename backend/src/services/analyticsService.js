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

exports.getAnalyticsData = async (url, filters = {}) => {

  const matchStage = {
    urlId: url._id
  };

  if (filters.startDate && filters.endDate) {
    matchStage.timestamp = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate + "T23:59:59.999Z")
    };
  }

  if (filters.browser === "Edge") {
  matchStage.userAgent = { $regex: "Edg", $options: "i" };
} 
else if (filters.browser === "Chrome") {
  matchStage.$and = [
    { userAgent: { $regex: "Chrome", $options: "i" } },
    { userAgent: { $not: /Edg/i } }
  ];
} 
else if (filters.browser) {
  matchStage.userAgent = { $regex: filters.browser, $options: "i" };
}

  const totalClicksAgg = await Click.countDocuments(matchStage);
  const totalClicks = totalClicksAgg;

  const uniqueVisitorsAgg = await Click.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { ip: "$ip", userAgent: "$userAgent" }
      }
    },
    { $count: "uniqueVisitors" }
  ]);

  const uniqueVisitors = uniqueVisitorsAgg[0]?.uniqueVisitors || 0;

  const dailyClicksAgg = await Click.aggregate([
    { $match: matchStage },
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
    { $match: matchStage },
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
    { $match: matchStage },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: "$userAgent", regex: "Edg" } }, then: "Edge" },
              { case: { $regexMatch: { input: "$userAgent", regex: "Chrome" } }, then: "Chrome" },
              { case: { $regexMatch: { input: "$userAgent", regex: "Firefox" } }, then: "Firefox" },
              { case: { $regexMatch: { input: "$userAgent", regex: "Safari" } }, then: "Safari" }
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