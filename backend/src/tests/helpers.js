const request = require("supertest");
const app = require("../app");

const User = require("../models/user");

async function register({ email, password }) {
    const res = await request(app).post("/api/auth/register").send({ email, password });

    if (![200, 201].includes(res.statusCode)) {
        throw new Error(
        `Register failed (${res.statusCode}): ${JSON.stringify(res.body)}`
        );
    }

    return res;
}

async function login({ email, password }) {
    const res = await request(app).post("/api/auth/login").send({ email, password });

    // If login failed, throw with useful info
    if (res.statusCode !== 200) {
        throw new Error(
        `Login failed (${res.statusCode}): ${JSON.stringify(res.body)}`
        );
    }

    // Try multiple common token shapes
    const token =
        res.body.token ||
        res.body.accessToken ||
        res.body.jwt ||
        res.body.access_token ||
        res.body?.data?.token ||
        res.body?.data?.accessToken;

    // Sometimes people return "Bearer <token>" in a field:
    const bearer =
        res.body.authorization ||
        res.body.Authorization ||
        res.body?.data?.authorization;

    const finalToken = token || (typeof bearer === "string" && bearer.startsWith("Bearer ")
        ? bearer.split(" ")[1]
        : null);

    if (!finalToken) {
        throw new Error(
        `No token found in login response body. Body was: ${JSON.stringify(res.body)}`
        );
    }

    return { res, token: finalToken };
}
  

async function createUserAndToken({
  email = `user_${Date.now()}@test.com`,
  password = "Password123!",
} = {}) {
  await register({ email, password });
  const { token } = await login({ email, password });
  if (!token) throw new Error("No token returned from login");
  return { email, password, token };
}

async function createAdminAndToken({
  email = `admin_${Date.now()}@test.com`,
  password = "Password123!",
} = {}) {
  // Register as normal user
  await register({ email, password });

  // Promote to admin in DB
  await User.updateOne({ email }, { $set: { role: "admin" } });

  // Login to get a token that now has admin role
  const { token } = await login({ email, password });
  if (!token) throw new Error("No token returned from admin login");
  return { email, password, token };
}

async function createProduct({ adminToken } = {}) {
  const body = {
    name: `Test Product ${Date.now()}`,
    priceCents: 1999,
    description: "test desc",
    images: [],
    category: "general",
    countInStock: 10,
    isActive: true,
  };

  const res = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(body);

  if (![200, 201].includes(res.statusCode)) {
    throw new Error(`createProduct failed: ${res.statusCode} ${JSON.stringify(res.body)}`);
  }

  return res.body;
}

module.exports = {
  app,
  request,
  createUserAndToken,
  createAdminAndToken,
  createProduct,
};
