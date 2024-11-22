// lib/redis.ts
import Redis from "ioredis";

const getRedisUrl = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined");
  }
  return process.env.REDIS_URL;
};

let redisClient: Redis | null = null;

try {
  redisClient = new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      console.log("Reconnection error:", err);
      return true;
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  redisClient.on("connect", () => {
    console.log("Successfully connected to Redis");
  });
} catch (error) {
  console.error("Redis Client Creation Error:", error);
  redisClient = null;
}

export default redisClient;
