import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { setupTestDB, teardownTestDB } from "./utils/testSetup.js";

describe("Customers CRUD", () => {
  let token, customer;

  beforeAll(async () => {
    const setup = await setupTestDB();
    token = setup.token;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test("Create customer", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Alice", email: "alice@example.com", credit_limit: 500 });
    expect(res.status).toBe(201);

    customer = res.body;
    expect(customer.name).toBe("Alice");
    expect(customer.credit_limit).toBe(500);
  });

  test("Read all customers", async () => {
    const res = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Read single customer", async () => {
    const res = await request(app)
      .get(`/api/customers/${customer.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Alice");
  });

  test("Update customer", async () => {
    const res = await request(app)
      .put(`/api/customers/${customer.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "12345", credit_limit: 600 });
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("12345");
    expect(res.body.credit_limit).toBe(600);
  });

  test("Delete customer", async () => {
    const res = await request(app)
      .delete(`/api/customers/${customer.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/);

    // Optional: ensure deletion in DB
    const dbCheck = await prisma.customer.findUnique({
      where: { id: customer.id },
    });
    expect(dbCheck).toBeNull();
  });
});
