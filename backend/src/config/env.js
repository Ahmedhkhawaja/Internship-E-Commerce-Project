const dotenv = require("dotenv");
dotenv.config();

const env = {
  PORT: Number(process.env.PORT || 5000),
  MONGODB_KEY: process.env.MONGODB_KEY || "",
};

module.exports = {env};
