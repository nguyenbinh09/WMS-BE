const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const request = require("supertest");
var server = request.agent("http://localhost:3001");

describe("Manage Transaction", () => {
  describe("POST /api/transaction", () => {
    it("should add a new transaction", async () => {
      // Assuming you have valid IDs for employee, partner, warehouse, and product
      const employeeId = "657c67bc72304d206a0fd151";
      const partnerId = "657f18f667cd20f02425d5f6";
      const warehouseId = "657f1381e25a1ba0b17e6682";
      const productId_1 = "6581ce428923c59d4b0b7f24";
      const productId_2 = "657f92abef29a525ed975be3";

      const res = await server.post("/api/transaction").send({
        type: "Inbound",
        employeeId,
        partnerId,
        warehouseId,
        details: [
          {
            productId_1,
            quantity: 10,
            total: 200,
          },
          {
            productId_2,
            quantity: 40,
            total: 500,
          },
        ],
        total: 700,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
    }, 30000);
  });

  describe("GET /api/transaction", () => {
    it("should get all transactions", async () => {
      const res = await server.get("/api/transaction");

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/transaction/inbound", () => {
    it("should get all inbound transactions", async () => {
      const res = await server.get("/api/transaction/inbound");

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/transaction/inbound/byWarehouse/:warehouseId", () => {
    it("should get inbound transactions by warehouse ID", async () => {
      const warehouseId = "657f1381e25a1ba0b17e6682";
      const res = await server.get(
        `/api/transaction/inbound/byWarehouse/${warehouseId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/transaction/outbound", () => {
    it("should get all outbound transactions", async () => {
      const res = await server.get("/api/transaction/outbound");

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/transaction/outbound/byWarehouse/:warehouseId", () => {
    it("should get outbound transactions by warehouse ID", async () => {
      const warehouseId = "657f1381e25a1ba0b17e6682";
      const res = await server.get(
        `/api/transaction/outbound/byWarehouse/${warehouseId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/transaction/:id", () => {
    it("should update a transaction by ID", async () => {
      const transactionId = "6581ce428923c59d4b0b7f21";
      const res = await server.put(`/api/transaction/${transactionId}`).send({
        partnerId: "657f18f667cd20f02425d5f6",
        total: 900,
        details: [
          {
            action: "update",
            id: "6581ce428923c59d4b0b7f24",
            productId: "657f1a2e67cd20f02425d656",
            quantity: 50,
            total: 900,
          },
        ],
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
    });
  });

  describe("PUT /api/transaction/status/:id", () => {
    it("should update the status of a transaction by ID", async () => {
      const transactionId = "6581b7c78923c59d4b0b7c6b";
      const res = await server
        .put(`/api/transaction/status/${transactionId}`)
        .send({
          status: "Done",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
    });
  });

  describe("DELETE /api/transaction/:id", () => {
    it("should delete a transaction by ID", async () => {
      // Assume you have a transaction ID from a previous test or known data
      const transactionId = "657ff483c7c013f34c3cc67a";
      const res = await server.delete(`/api/transaction/${transactionId}`);

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
    });
  });
});
