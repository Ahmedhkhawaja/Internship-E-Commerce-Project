const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";

function authAdmin (req, res, next) {
  // Admin guard: verify token then check role.
  const authHeader = req.headers.authorization;
  // Check for auth header if its present
  if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });

  // Data in "Bearer <token>" format
  const data = authHeader.split(" ");
  const bearer = data[0];
  const token = data[1];

  if ("Bearer" !== bearer || !token) return res.status(401).json({ message: "Incorrect format 'Bearer <token>'"});

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    
    req.user = decoded
    
    if (req.user.role !== "admin") {
      return res.status(403).json({message: "Admin access required"})
    }
    next();
  } catch (error) {
    return res.status(401).json({message: "Token is expired or incorrect"})
  }
}

function authUser (req, res, next) {
  // User guard: verify token and attach decoded payload.
  const authHeader = req.headers.authorization;
  // Check for auth header if its present
  if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });

  // Data in "Bearer <token>" format
  const data = authHeader.split(" ");
  const bearer = data[0];
  const token = data[1];

  if ("Bearer" !== bearer || !token) return res.status(401).json({ message: "Incorrect format 'Bearer <token>'"});

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    
    req.user = decoded
    next();
  } catch (error) {
    return res.status(401).json({message: "Token is expired or incorrect"})
  }
}

module.exports = { authUser, authAdmin };