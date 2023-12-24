const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const request = require("supertest");
var server = request.agent("http://localhost:3001");

describe("Manage Employee", () => {
  describe("POST /api/employee", () => {
    it("should returned add new employee", async () => {
      const res = await server.post("/api/employee").send({
        name: "John Doe abc",
        position: "Employee",
        startDate: "01/01/2022",
        gender: "male",
        idCard: "121512184124",
        birthday: "01/01/1990",
        email: "john.doe@example.com",
        phone_num: "123456789",
        address: "123 Main St",
        warehouseId: "657f1395e25a1ba0b17e6689",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
    }, 30000);
  });

  describe("GET /api/employee", () => {
    it("should returned all employees", async () => {
      const res = await server.get("/api/employee");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe("GET /api/employee/manager", () => {
    it("should returned all managers", async () => {
      const res = await server.get("/api/employee/manager");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe("GET /api/employee/staff", () => {
    it("should returned all staffs", async () => {
      const res = await server.get("/api/employee/staff");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe("GET /api/employee/:id", () => {
    it("should returned employee by ID", async () => {
      const employeeId = "657f0c1d67cd20f02425d1be";
      const res = await server.get(`/api/employee/${employeeId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    }, 30000);
  });

  describe("GET /api/employee/staff/byWarehouse/:warehouseId", () => {
    it("should returned employee by warehouse ID", async () => {
      const warehouseId = "657f13bfe25a1ba0b17e668f";
      const res = await server.get(
        `/api/employee/staff/byWarehouse/${warehouseId}`
      );
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    }, 30000);
  });

  describe("PUT /api/employee/:id", () => {
    it("should update a employee by ID", async () => {
      // Assume you have a employee ID from a previous test or known data
      const employeeId = "657f0c1d67cd20f02425d1be";
      const res = await server.put(`/api/employee/${employeeId}`).send({
        name: "Updated Employee 123",
        startDate: "01/01/2022",
        gender: "female",
        idCard: "XYZ78901212",
        birthday: "01/01/1985",
        email: "updated.employee@example.com",
        phone_num: "987654321",
        address: "456 Oak St",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("DELETE /api/employee/:id", () => {
    it("should delete a employee by ID", async () => {
      const employeeId = "657c67bc72304d206a0fd151";
      const res = await server.delete(`/api/employee/${employeeId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });
  });
});
