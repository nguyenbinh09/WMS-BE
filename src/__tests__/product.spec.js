const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const request = require("supertest");
var server = request.agent("http://localhost:3001");

describe("Manage Product", () => {
  describe("POST /api/product", () => {
    it("should add a new product", async () => {
      const res = await server.post("/api/product").send({
        name: "Product Name 2",
        maximumQuantity: 200,
        price: 40.0,
        unit: "Bottle",
        specification: "Some specifications",
        warehouseId: "657f1381e25a1ba0b17e6682",
        supplierId: "657f16e167cd20f02425d526",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
    }, 30000);
  });

  describe("GET /api/product", () => {
    it("should get all products", async () => {
      const res = await server.get("/api/product");

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/product/byWarehouse/:warehouseId", () => {
    it("should get products by warehouse ID", async () => {
      const warehouseId = "657f1381e25a1ba0b17e6682";
      const res = await server.get(`/api/product/byWarehouse/${warehouseId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/product/:id", () => {
    it("should get a product by ID", async () => {
      const productId = "657f1a2e67cd20f02425d656";
      const res = await server.get(`/api/product/${productId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("PUT /api/product/:id", () => {
    it("should update a product by ID", async () => {
      const productId = "657f1a2e67cd20f02425d656";
      const res = await server.put(`/api/product/${productId}`).send({
        name: "Updated Product Name",
        maximumQuantity: 150,
        price: 60.0,
        unit: "Set",
        specification: "Updated specifications",
        supplierId: "657f170267cd20f02425d536",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("DELETE /api/product/:id", () => {
    it("should delete a product by ID", async () => {
      const productId = "657f927aef29a525ed975bd5";
      const res = await server.delete(`/api/product/${productId}`);

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
    });
  });
});
