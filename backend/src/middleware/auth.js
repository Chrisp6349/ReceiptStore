import jwt from "jsonwebtoken";

// Authenticates a customer app request. Attaches req.customer so route
// handlers never need to trust a customer_id supplied by the client.
export function requireCustomerAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = { userId: payload.userId, customerId: payload.customerId, receiptstoreId: payload.receiptstoreId };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
