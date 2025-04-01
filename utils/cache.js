const Redis = require('ioredis')
const redis = new Redis({
  host: "redis",  // Match the service name in docker-compose
  port: 6379,
  password: process.env.REDIS_PASSWORD
});

const CACHE_EXPIRATION = process.env.CACHE_EXPIRATION
const CACHE_KEY = process.env.CACHE_KEY
const CACHE_INDEX_KEY = process.env.CACHE_INDEX_KEY
const BLOG_FREQ_KEY = process.env.BLOG_FREQ_KEY

//save individual blog to cache
const saveBlogToCache = async(blog)=> {
    const key = `${CACHE_KEY}:${blog._id}`
    await redis.set(key, JSON.stringify(blog), "EX", CACHE_EXPIRATION)
}

//get single blog from cache
const getBlogFromCache = async (blogId) => {
  const key = `${CACHE_KEY}:${blogId}`;
  const cachedBlog = await redis.get(key);
  return cachedBlog ? JSON.parse(cachedBlog) : null;
};

//retrieve all cached blogs
const getCachedBlogs = async() => {
    const keys = await redis.keys(`${CACHE_KEY}:*`)
    if(keys.length == 0)return [];

    const blogData = await redis.mget(keys);
    return blogData.map((data)=> JSON.parse(data))
}

//delete blog, their freq and from set of redis
const deleteBlogFromCache = async (blogID) => {
  const blogCacheKey = `${CACHE_KEY}:${blogID}`;

  // Perform all deletions in parallel for efficiency
  await Promise.all([
    redis.del(blogCacheKey),          // Remove blog from cache
    redis.srem(CACHE_INDEX_KEY, blogID), // Remove blog from cache index
    redis.zrem(BLOG_FREQ_KEY, blogID),   // Remove blog frequency tracking
  ]);
};

//increment blog frequency
const incrementBlogFrequency = async (blogId) => {
    return await redis.zincrby(BLOG_FREQ_KEY, 1, blogId);
  };

// Get blog frequency
const getBlogFrequency = async (blogId) => {
    const score = await redis.zscore(BLOG_FREQ_KEY, blogId);
    return parseFloat(score) || 0;
  };

// Add blog ID to cache index
const addToCacheIndex = async (blogId) => {
    await redis.sadd(CACHE_INDEX_KEY, blogId);
  };


// Check if blog has been sent before
const isBlogSent = async (blogId) => {
    return await redis.sismember(CACHE_INDEX_KEY, blogId);
  };
  
  // Retrieve all sent blog IDs
  const getCacheIndex = async () => {
    return await redis.smembers(CACHE_INDEX_KEY);
  };

  //clear whole redis set which keeps data of already sent blogs
  const clearRedisSet = async() => {
    await redis.del(CACHE_INDEX_KEY);
  }
  
  module.exports = {
    saveBlogToCache,
    getCachedBlogs,
    incrementBlogFrequency,
    getBlogFrequency,
    addToCacheIndex,
    isBlogSent,
    getCacheIndex,
    getBlogFromCache,
    deleteBlogFromCache,
    clearRedisSet
  };