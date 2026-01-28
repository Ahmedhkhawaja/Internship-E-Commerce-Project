const {
    request,
    app,
    createUserAndToken,
    createAdminAndToken,
    createProduct,
  } = require("./helpers");
  
  describe("Orders (admin)", () => {
    it("blocks non-admin from /api/admin/orders", async () => {
      const user = await createUserAndToken();
  
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${user.token}`);
  
      expect([401, 403]).toContain(res.statusCode);
    });
  
    it("admin can list all orders (returns {orders})", async () => {
      const admin = await createAdminAndToken();
  
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${admin.token}`);
  
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.orders)).toBe(true);
    });
  
    it("admin can view order and update status via PATCH", async () => {
      const admin = await createAdminAndToken();
      const user = await createUserAndToken();
  
      const product = await createProduct({ adminToken: admin.token });
  
      const placed = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ items: [{ productId: product._id, quantity: 3 }] });
  
      expect(placed.statusCode).toBe(201);
      const orderId = placed.body._id;
  
      const details = await request(app)
        .get(`/api/admin/orders/${orderId}`)
        .set("Authorization", `Bearer ${admin.token}`);
  
      expect(details.statusCode).toBe(200);
  
      // order is returned directly and populated userId has email
      expect(details.body.userId).toBeDefined();
      expect(details.body.userId.email).toBeDefined();
  
      const updated = await request(app)
        .patch(`/api/admin/orders/${orderId}`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ status: "paid" });
  
      expect(updated.statusCode).toBe(200);
      expect(updated.body.status).toBe("paid");
      expect(updated.body.userId.email).toBeDefined();
    });
  });

