const Queue = require("bull");
const redis = require("../config/redis");

const clickQueue = new Queue("clickQueue", {
  redis: {
    host: redis.options.host,
    port: redis.options.port,
    password: redis.options.password,
    tls: {},
  },
});

module.exports = clickQueue;