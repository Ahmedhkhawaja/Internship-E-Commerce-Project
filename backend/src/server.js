const app = require("./app");
const { dataBase } = require("./config/db");
const { env } = require("./config/env");

async function start () {
  await dataBase();

  app.listen(env.PORT, () => {
    console.log(`Server running on: http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error("Server failed:", err.message);
  process.exitCode = 1;
})