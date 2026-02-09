const { request, app, createUserAndToken } = require("./helpers");

describe("Auth", () => {
  it("registers a user and returns token + user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: `reg_${Date.now()}@test.com`,
      password: "Password123!",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBeDefined();
    expect(res.body.user.role).toBeDefined();
  });

  it("logs in a user and returns token", async () => {
    const email = `login_${Date.now()}@test.com`;
    const password = "Password123!";

    await request(app).post("/api/auth/register").send({ email, password });

    const res = await request(app).post("/api/auth/login").send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.foundUser).toBeDefined();
    expect(res.body.foundUser.email).toBe(email);
  });

  it("refreshes access token using refresh cookie", async () => {
    const email = `refresh_${Date.now()}@test.com`;
    const password = "Password123!";

    await request(app).post("/api/auth/register").send({ email, password });
    const loginRes = await request(app).post("/api/auth/login").send({ email, password });

    expect(loginRes.statusCode).toBe(200);
    const cookies = loginRes.headers["set-cookie"];
    expect(Array.isArray(cookies)).toBe(true);

    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookies);

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.accessToken).toBeDefined();
  });

  it("blocks /me without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect([401, 403]).toContain(res.statusCode);
  });

  it("returns current user on /me with token", async () => {
    const user = await createUserAndToken();

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.role).toBeDefined();
  });
});
