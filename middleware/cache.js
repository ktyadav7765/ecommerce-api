const redis = require('../config/redis');

const cache = (keyGenerator, ttl = 300) => {
  return async (req, res, next) => {
    try {
      const key = typeof keyGenerator === 'function'
        ? keyGenerator(req)
        : keyGenerator;

      const cachedData = await redis.get(key);

      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      res.sendResponse = res.json;

      res.json = async (body) => {
        await redis.set(key, JSON.stringify(body), 'EX', ttl);
        res.sendResponse(body);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = cache;
