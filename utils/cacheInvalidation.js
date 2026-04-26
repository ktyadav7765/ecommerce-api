const redis = require('../config/redis');

const clearProductCache = async () => {
  const keys = await redis.keys('products:*');
  const featuredKeys = await redis.keys('featured:*');
  const productIdKeys = await redis.keys('product-id:*');
  const productSlugKeys = await redis.keys('product-slug:*');
  const categoryProductKeys = await redis.keys('category-products:*');

  const allKeys = [
    ...keys,
    ...featuredKeys,
    ...productIdKeys,
    ...productSlugKeys,
    ...categoryProductKeys
  ];

  if (allKeys.length) {
    await redis.del(...allKeys);
  }
};

const clearCategoryCache = async () => {
  const keys = await redis.keys('categories:*');
  const categoryKeys = await redis.keys('category:*');

  const allKeys = [...keys, ...categoryKeys];

  if (allKeys.length) {
    await redis.del(...allKeys);
  }
};

module.exports = {
  clearProductCache,
  clearCategoryCache
};
