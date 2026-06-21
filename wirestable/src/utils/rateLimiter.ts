import { NextRequest } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

const tracker = new Map<string, RateLimitRecord>();

// Clean up memory leaks from inactive IPs every 5 minutes
if (typeof window === "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of tracker.entries()) {
      const activeTimestamps = record.timestamps.filter((t) => now - t < 60000);
      if (activeTimestamps.length === 0) {
        tracker.delete(ip);
      } else {
        record.timestamps = activeTimestamps;
      }
    }
  }, 300000);
}

/**
 * Validates request count for a given client IP within a window.
 * @param req NextRequest context to recover client IP
 * @param limit maximum requests allowed
 * @param windowMs window duration in milliseconds (default 1 minute)
 */
export function rateLimit(req: NextRequest, limit: number = 60, windowMs: number = 60000): {
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
} {
  // Recover client IP from headers (x-forwarded-for or similar)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  
  const now = Date.now();
  let record = tracker.get(ip);
  
  if (!record) {
    record = { timestamps: [] };
    tracker.set(ip, record);
  }
  
  // Clean timestamps outside window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
  
  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const reset = oldest + windowMs;
    return {
      success: false,
      remaining: 0,
      limit,
      reset,
    };
  }
  
  record.timestamps.push(now);
  return {
    success: true,
    remaining: limit - record.timestamps.length,
    limit,
    reset: now + windowMs,
  };
}
