// Authenticates a Demo Till request with a static shared secret. This
// stands in for real till/device provisioning, which is out of scope for
// Prototype 001 — every till shares one key, set via TILL_API_KEY.
export function requireTillAuth(req, res, next) {
  const key = req.headers["x-till-api-key"];
  if (!key || key !== process.env.TILL_API_KEY) {
    return res.status(401).json({ error: "Missing or invalid till API key" });
  }
  next();
}
