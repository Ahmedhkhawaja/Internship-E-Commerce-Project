const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { signAccessToken, signRefreshToken } = require("../utils/tokens");
const { getRefreshCookieOptions } = require("../utils/cookies");
const { hashToken } = require("../utils/hash");

const MAX_REFRESH_TOKENS = 5;

// Keep refresh token list bounded to avoid unbounded growth.
function trimRefreshTokens(tokens) {
  if (!Array.isArray(tokens)) return [];
  return tokens.slice(-MAX_REFRESH_TOKENS);
}


async function register(req, res) {
  const {email, password} = req.body;

  // Valid Input
  if (!email || !password) 
    return res.status(400).json({ message: "email and password are required" });

  if (typeof password !== "string" || password.length < 8) 
    return res.status(400).json({ message: "password must be at least 8 characters" });

  const formattedEmail = String(email).toLowerCase().trim();
  

  // Check if exists
  const existing = await User.findOne({email: formattedEmail});
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  // Hash Password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create User
  const newUser = await User.create({
    email: formattedEmail,
    passwordHash,
  })

  // Making the token  
  const accessToken = signAccessToken(newUser);
  const refreshToken = signRefreshToken(newUser);

  // Store hashed refresh token (never store raw refresh tokens).
  newUser.refreshTokens = newUser.refreshTokens || [];
  newUser.refreshTokens.push(hashToken(refreshToken));
  newUser.refreshTokens = trimRefreshTokens(newUser.refreshTokens);
  await newUser.save();
  
  // Set refresh cookie as httpOnly to keep it out of JS.
  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
  
  // Return token + user info
  return res.status(201).json({
    token: accessToken,
    accessToken,
    user: { id: newUser._id, email: newUser.email, role: newUser.role },
  });
}


async function login(req, res) {
  const {email, password} = req.body;

  if (!email || !password) 
    return res.status(400).json({ message: "email and password are required" });

  const formattedEmail = String(email).toLowerCase().trim();

  const foundUser = await User.findOne({email: formattedEmail});
  if (!foundUser) 
    return res.status(401).json({ message: "Invalid credentials" });

  const samePass = await bcrypt.compare(password, foundUser.passwordHash);
  if (!samePass) 
    return res.status(401).json({ message: "Invalid credentials" });
  
  // Issue tokens on successful login.
  const accessToken = signAccessToken(foundUser);
  const refreshToken = signRefreshToken(foundUser);

  // Store hashed refresh token for rotation tracking.
  foundUser.refreshTokens = foundUser.refreshTokens || [];
  foundUser.refreshTokens.push(hashToken(refreshToken));
  foundUser.refreshTokens = trimRefreshTokens(foundUser.refreshTokens);
  await foundUser.save();

  // Set refresh cookie as httpOnly to prevent XSS access.
  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

  return res.json({
    token: accessToken,
    accessToken,
    user: { id: foundUser._id, email: foundUser.email, role: foundUser.role },
    foundUser: { id: foundUser._id, email: foundUser.email, role: foundUser.role },
  });
}

async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "Missing refresh token" });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await User.findById(payload.userId);
  if (!user) return res.status(401).json({ message: "User not found" });

  const hashed = hashToken(token);
  const allowed = (user.refreshTokens || []).includes(hashed);
  if (!allowed) {
    return res.status(401).json({ message: "Refresh token revoked" });
  }

  // Rotate refresh token to invalidate older cookie.
  const newRefreshToken = signRefreshToken(user);
  const newHashed = hashToken(newRefreshToken);

  user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== hashed);
  user.refreshTokens.push(newHashed);
  user.refreshTokens = trimRefreshTokens(user.refreshTokens);
  await user.save();

  // Set new cookie and return a fresh access token.
  res.cookie("refreshToken", newRefreshToken, getRefreshCookieOptions());

  // Issue new access token after refresh.
  const accessToken = signAccessToken(user);

  return res.json({ accessToken });
}

async function logout(req, res) {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.userId);

      if (user) {
        const hashed = hashToken(token);
        user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== hashed);
        await user.save();
      }
    } catch (e) {

    }
  }

  res.clearCookie("refreshToken", {
    ...getRefreshCookieOptions(),
    maxAge: 0,
  });

  return res.json({ message: "Logged out" });
}

async function me(req, res) {
  const myUser = await User.findById(req.user.userId).select("_id email role createdAt");
  if (!myUser) 
    return res.status(404).json({ message: "User not found" });
  return res.json({user: myUser});
}


module.exports = {register, login, me, logout, refresh}