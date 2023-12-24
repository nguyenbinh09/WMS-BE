const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const request = require("supertest");
var server = request.agent("http://localhost:3001");
const Warehouse = require("../models/warehouseModel");

describe("Manage Warehouse", () => {
  describe("POST /api/warehouse", () => {
    it("should returned add new warehouse", async () => {
      const res = await server.post("/api/warehouse").send({
        name: "warehouse 1212",
        capacity: null,
        description: "áqweqrqw",
        email: "gm3c@gmail.com",
        phone_num: "0664215122",
        address: "abc, 124, 21",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeDefined();
    }, 30000);
  });

  describe("GET /api/warehouse", () => {
    it("should returned all warehouses", async () => {
      const res = await server.get("/api/warehouse");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe("GET /api/warehouse/:id", () => {
    it("should returned warehouse by ID", async () => {
      const warehouseId = "657f1381e25a1ba0b17e6682";
      const res = await server.get(`/api/warehouse/${warehouseId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    }, 30000);
  });

  describe("PUT /api/warehouse/:id", () => {
    it("should update a warehouse by ID", async () => {
      // Assume you have a warehouse ID from a previous test or known data
      const warehouseId = "657f1381e25a1ba0b17e6682";
      const res = await server.put(`/api/warehouse/${warehouseId}`).send({
        name: "Updated Warehouse",
        capacity: 10000,
        description: "Updated description",
        email: "updated@gmail.com",
        phone_num: "0664215000",
        address: "updated address",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("DELETE /api/warehouse/:id", () => {
    it("should delete a warehouse by ID", async () => {
      const warehouseId = "65814b10b145be71523c190b";
      const res = await server.delete(`/api/warehouse/${warehouseId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });
  });
});
