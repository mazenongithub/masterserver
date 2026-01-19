const rateLimitMap = new Map();

export function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  const entry = rateLimitMap.get(ip) || { count: 0, start: now };

  if (now - entry.start > windowMs) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count++;
  }

  rateLimitMap.set(ip, entry);

  if (entry.count > maxRequests) {
    return res.status(429).json({
      error: "Too many requests. Please try again later."
    });
  }

  next();
}
