export function checkSessionGFK(req, res, next) {
  if (req.session && req.session.engineerId) {
    return next(); // ✅ user is logged in — continue
  }

  return res.status(401).json({ message: "Unauthorized — please log in first" });
}