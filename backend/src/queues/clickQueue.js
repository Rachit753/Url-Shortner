const Queue = require("bull");
const redis = require("../config/redis");

const clickQueue = new Queue("click-queue", {
  redis: {
    host: redis.options.host,
    port: redis.options.port,
  },
});

module.exports = clickQueue;