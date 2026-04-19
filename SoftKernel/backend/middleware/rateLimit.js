/**
 * Simple in-memory rate limiter (no extra dependency needed).
 * Limits each IP to `max` requests per `windowMs` window.
 */

const hits = new Map(); // ip -> { count, resetTime }

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 200;          // per window

export const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();

  let entry = hits.get(ip);

  if (!entry || now > entry.resetTime) {
    entry = { count: 1, resetTime: now + WINDOW_MS };
    hits.set(ip, entry);
  } else {
    entry.count++;
  }

  // Set rate limit headers
  res.set('X-RateLimit-Limit', String(MAX_REQUESTS));
  res.set('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - entry.count)));
  res.set('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));

  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
    });
  }

  next();
};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) {
    if (now > entry.resetTime) hits.delete(ip);
  }
}, 5 * 60 * 1000);

export default { rateLimiter };
