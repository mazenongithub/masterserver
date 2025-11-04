export function checkSessionDriver(req, res, next) {
  if (req.session && req.session.driverId) {
    return next(); // ✅ user is logged in — continue
  }

  return res.status(401).json({ message: "Unauthorized — please log in first" });
}
