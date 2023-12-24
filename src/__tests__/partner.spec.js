const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const request = require("supertest");
var server = request.agent("http://localhost:3001");

describe("Manage Partner", () => {
  describe("POST /api/partner", () => {
    it("should add a new partner", async () => {
      const res = await server.post("/api/partner").send({
        name: "Partner Name",
        type: "Supplier",
        email: "partner@example.com",
        phone_num: "123456789",
        address: "123 Main St",
        warehouseId: "657f1381e25a1ba0b17e6682",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
    }, 30000);
  });

  describe("GET /api/partner", () => {
    it("should get all partners", async () => {
      const res = await server.get("/api/partner");

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeDefined();
    });
  });

  describe("GET /api/partner/customer", () => {
    it("should get all customers", async () => {
      const res = await server.get("/api/partner/customer");

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeDefined();
    });
  });

  describe("GET /api/partner/customer/byWarehouse/:warehouseId", () => {
    it("should get customers by warehouse ID", async () => {
      // Replace 'your-warehouse-id' with a valid warehouse ID
      const warehouseId = "657f1381e25a1ba0b17e6682";
      const res = await server.get(
        `/api/partner/customer/byWarehouse/${warehouseId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/partner/supplier", () => {
    it("should get all suppliers", async () => {
      const res = await server.get("/api/partner/supplier");

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/partner/supplier/byWarehouse/:warehouseId", () => {
    it("should get suppliers by warehouse ID", async () => {
      const warehouseId = "657f1381e25a1ba0b17e6682";
      const res = await server.get(
        `/api/partner/supplier/byWarehouse/${warehouseId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/partner/:id", () => {
    it("should update a partner by ID", async () => {
      // Assume you have a partner ID from a previous test or known data
      const partnerId = "657f18e667cd20f02425d5ed";
      const res = await server.put(`/api/partner/${partnerId}`).send({
        name: "Updated Partner Name",
        email: "updated.partner@example.com",
        phone_num: "987654321",
        address: "456 Oak St",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("DELETE /api/partner/:id", () => {
    it("should delete a partner by ID", async () => {
      // Assume you have a partner ID from a previous test or known data
      const partnerId = "6581aaa90c1a82cb9c7f2582";
      const res = await server.delete(`/api/partner/${partnerId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });
  });
});
