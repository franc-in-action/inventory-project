import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { setupTestDB, teardownTestDB } from "./utils/testSetup.js";

describe("Products API", () => {
  let token;
  let location;

  beforeAll(async () => {
    const setup = await setupTestDB();
    token = setup.token;
    location = setup.location;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it("should create a product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sku: "P001",
        name: "Test Product",
        description: "Sample",
        price: 100.5,
        quantity: 10,
        locationId: location.id,
      });

    if (res.status !== 201) console.error("Product creation failed:", res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("sku", "P001");
  });

  it("should list products", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);

    if (res.status !== 200) console.error("Product listing failed:", res.body);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("should update a product", async () => {
    const product = await prisma.product.findFirst();
    if (!product) throw new Error("Product not found");

    const res = await request(app)
      .put(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name" });

    if (res.status !== 200) console.error("Product update failed:", res.body);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });

  it("should delete a product", async () => {
    const product = await prisma.product.create({
      data: {
        sku: "PDELETE",
        name: "Temp Product",
        price: 1,
        quantity: 1,
        locationId: location.id,
      },
    });

    const res = await request(app)
      .delete(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${token}`);

    if (res.status !== 200) console.error("Product deletion failed:", res.body);

    expect(res.status).toBe(200);

    const deleted = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(deleted).toBeNull();
  });
});
