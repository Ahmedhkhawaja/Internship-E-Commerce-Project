const mongoose = require("mongoose");
const { env } = require("./env");

async function dataBase() {
  if (!env.MONGODB_KEY) {
    throw new Error("MONGODB_KEY is missing in backend/.env");
  }

  await mongoose.connect(env.MONGODB_KEY);
  console.log("MongoDB connected");
}

module.exports = { dataBase };

