import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { setupTestDB, teardownTestDB } from "./utils/testSetup.js";
import { v4 as uuidv4 } from "uuid";

describe("Purchases Flow", () => {
  let token, location, product, vendor;

  beforeAll(async () => {
    const setup = await setupTestDB();
    token = setup.token;
    location = setup.location;

    vendor = await prisma.vendor.create({ data: { name: "Supplier 1" } });

    product = await prisma.product.create({
      data: {
        sku: "PO001",
        name: "PO Product",
        price: 30,
        quantity: 0,
        locationId: location.id,
      },
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test("Create PO and receive stock", async () => {
    // Create purchase
    const poData = {
      vendorId: vendor.id,
      locationId: location.id,
      items: [{ productId: product.id, qty: 50, price: 30 }],
    };
    const poRes = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${token}`)
      .send(poData);
    expect(poRes.status).toBe(201);

    // Receive purchase
    const receiveRes = await request(app)
      .put(`/api/purchases/${poRes.body.id}/receive`)
      .set("Authorization", `Bearer ${token}`);
    expect(receiveRes.status).toBe(200);
    expect(receiveRes.body.received).toBe(true);

    // StockLevel incremented
    const stock = await prisma.stockLevel.findUnique({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: location.id,
        },
      },
    });
    expect(stock.quantity).toBe(50);
  });

  test("Cannot receive same PO twice", async () => {
    const poData = {
      vendorId: vendor.id,
      locationId: location.id,
      items: [{ productId: product.id, qty: 10, price: 30 }],
    };
    const poRes = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${token}`)
      .send(poData);
    expect(poRes.status).toBe(201);

    const receiveRes1 = await request(app)
      .put(`/api/purchases/${poRes.body.id}/receive`)
      .set("Authorization", `Bearer ${token}`);
    expect(receiveRes1.status).toBe(200);

    const receiveRes2 = await request(app)
      .put(`/api/purchases/${poRes.body.id}/receive`)
      .set("Authorization", `Bearer ${token}`);
    expect(receiveRes2.status).toBe(400);
  });

  test("Cannot create PO with duplicate purchaseUuid", async () => {
    // Generate a UUID manually
    const duplicateUuid = "dup-uuid-123";

    // Create first PO with specific UUID
    const poData1 = {
      vendorId: vendor.id,
      locationId: location.id,
      items: [{ productId: product.id, qty: 5, price: 30 }],
      purchaseUuid: duplicateUuid,
    };
    const poRes1 = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${token}`)
      .send(poData1);
    expect(poRes1.status).toBe(201);

    // Attempt to create second PO with same UUID
    const poData2 = {
      vendorId: vendor.id,
      locationId: location.id,
      items: [{ productId: product.id, qty: 10, price: 30 }],
      purchaseUuid: duplicateUuid,
    };
    const poRes2 = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${token}`)
      .send(poData2);

    expect(poRes2.status).toBe(400);
    expect(poRes2.body.error).toMatch(/already exists/i);
  });

  test("Cannot receive PO without a purchaseUuid", async () => {
    // Directly create a PO in the DB without a purchaseUuid
    const po = await prisma.purchase.create({
      data: {
        vendorId: vendor.id,
        locationId: location.id,
        total: 100,
        received: false,
        purchaseUuid: "", // empty string to simulate missing
      },
    });

    const res = await request(app)
      .put(`/api/purchases/${po.id}/receive`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/UUID missing/i);
  });
});
