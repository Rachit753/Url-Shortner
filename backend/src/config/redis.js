const Redis = require("ioredis");

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is NOT defined");
}

console.log("REDIS_URL =", process.env.REDIS_URL);

const redis = new Redis(process.env.REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (err) => {
  console.error("Redis Error:", err.message);
});

module.exports = redis;