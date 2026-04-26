const Queue = require('bull');

const orderQueue = new Queue('order-processing', process.env.REDIS_URL || {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || undefined
  }
});

module.exports = {
  orderQueue
};
