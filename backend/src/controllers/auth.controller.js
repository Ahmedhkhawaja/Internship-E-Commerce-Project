const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

function accessToken(usertoken) {
  return jwt.sign(
    { userId: String(usertoken._id), 
      role: usertoken.role},
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
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
  const token = accessToken(newUser);

  // Return token + user info
  return res.status(201).json({
    token,
    user: {id: newUser._id, email: newUser.email, role: newUser.role}
  })
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
  
  const token = accessToken(foundUser);

  return res.json({
    token,
    foundUser: { id:foundUser._id, email: foundUser.email, role: foundUser.role }
  })
}

async function me(req, res) {
  const myUser = await User.findById(req.user.userId).select("_id email role createdAt");
  if (!myUser) 
    return res.status(404).json({ message: "User not found" });
  return res.json({user: myUser});
}


module.exports = {register, login, me}