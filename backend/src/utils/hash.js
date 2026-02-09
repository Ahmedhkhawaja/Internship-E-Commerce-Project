const crypto = require("crypto");

// Hash refresh tokens before storing in DB.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { hashToken };
