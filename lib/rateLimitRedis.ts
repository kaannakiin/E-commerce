import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

// Varsayılan değerler
const DEFAULT_RATE_LIMIT = 100;
const DEFAULT_WINDOW_MINUTES = 60;

// Options interface'i
interface RateLimitOptions {
  limit?: number;
  windowInMinutes?: number;
}

// Response interface'i
interface RateLimitResponse {
  success: boolean;
  remaining: number;
  current?: number;
  reset?: number;
  limit: number;
  windowInMinutes: number;
  error?: string;
}

export const rateLimiter = async (
  ip: string,
  options: RateLimitOptions = {},
): Promise<RateLimitResponse> => {
  const limit = options.limit || DEFAULT_RATE_LIMIT;
  const windowInMinutes = options.windowInMinutes || DEFAULT_WINDOW_MINUTES;
  const windowInSeconds = windowInMinutes * 60;

  try {
    const ipCheck = await redis.get(ip);

    if (ipCheck === null) {
      await redis.set(ip, 1, "EX", windowInSeconds);
      return {
        success: true,
        remaining: limit - 1,
        current: 1,
        limit,
        windowInMinutes,
      };
    }

    const requestCount = parseInt(ipCheck);
    const remaining = limit - requestCount;

    if (requestCount >= limit) {
      const ttl = await redis.ttl(ip);

      return {
        success: false,
        remaining: 0,
        current: requestCount,
        reset: ttl,
        limit,
        windowInMinutes,
      };
    }

    await redis.incr(ip);

    return {
      success: true,
      remaining: remaining - 1,
      current: requestCount + 1,
      limit,
      windowInMinutes,
    };
  } catch (error) {
    try {
      await redis.ping();
    } catch (pingError) {
      redis.disconnect();
      await redis.connect();
    }

    return {
      success: true,
      remaining: limit,
      error: error instanceof Error ? error.message : "Unknown error",
      limit,
      windowInMinutes,
    };
  }
};
