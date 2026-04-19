const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "paystream-hela-secret-2026";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      walletAddress: user.wallet_address,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function hrOnly(req, res, next) {
  if (req.user.role !== "hr") {
    return res.status(403).json({ error: "HR access required" });
  }
  next();
}

function employeeOnly(req, res, next) {
  if (req.user.role !== "employee") {
    return res.status(403).json({ error: "Employee access required" });
  }
  next();
}

module.exports = { generateToken, authMiddleware, hrOnly, employeeOnly, JWT_SECRET };