const {
    request,
    app,
    createUserAndToken,
    createAdminAndToken,
    createProduct,
  } = require("./helpers");
  
  describe("Orders (user)", () => {
    it("blocks creating an order without auth", async () => {
      const res = await request(app).post("/api/orders").send({
        items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
      });
  
      expect([401, 403]).toContain(res.statusCode);
    });
  
    it("rejects empty items", async () => {
      const user = await createUserAndToken();
  
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ items: [] });
  
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Cart is empty");
    });
  
    it("creates an order from cart items", async () => {
      const admin = await createAdminAndToken();
      const user = await createUserAndToken();
  
      const product = await createProduct({ adminToken: admin.token });
  
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ items: [{ productId: product._id, quantity: 2 }] });
  
      expect(res.statusCode).toBe(201);
  
      // order is returned directly
      expect(res.body._id).toBeDefined();
      expect(res.body.userId).toBeDefined();
      expect(res.body.items).toHaveLength(1);
      expect(res.body.totalCents).toBe(1999 * 2);
      expect(res.body.status).toBe("pending");
    });
  
    it("lists my orders at GET /api/orders/my", async () => {
      const user = await createUserAndToken();
  
      const res = await request(app)
        .get("/api/orders/my")
        .set("Authorization", `Bearer ${user.token}`);
  
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.orders)).toBe(true);
    });
  
    it("blocks accessing another user's order", async () => {
      const admin = await createAdminAndToken();
      const userA = await createUserAndToken();
      const userB = await createUserAndToken();
  
      const product = await createProduct({ adminToken: admin.token });
  
      const placed = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userA.token}`)
        .send({ items: [{ productId: product._id, quantity: 1 }] });
  
      expect(placed.statusCode).toBe(201);
      const orderId = placed.body._id;
  
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${userB.token}`);
  
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });
  