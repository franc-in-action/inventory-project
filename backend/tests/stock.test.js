import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { setupTestDB, teardownTestDB } from "./utils/testSetup.js";

describe("Stock Movements", () => {
  let token;
  let product;
  let location;

  beforeAll(async () => {
    const setup = await setupTestDB();
    token = setup.token;
    location = setup.location;

    // Seed a product for stock movements
    product = await prisma.product.create({
      data: {
        sku: "STK001",
        name: "Stock Test",
        price: 10,
        quantity: 0,
        locationId: location.id,
      },
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test("Create stock movement updates ledger and stock_levels", async () => {
    const movementUuid = "MOV-001";
    const delta = 5;
    const reason = "Initial stock";

    const res = await request(app)
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${token}`)
      .send({
        movementUuid,
        productId: product.id,
        locationId: location.id,
        delta,
        reason,
      });

    expect(res.status).toBe(201);

    // Check StockMovement
    const movement = await prisma.stockMovement.findUnique({
      where: { movementUuid },
    });
    expect(movement).not.toBeNull();
    expect(movement.delta).toBe(delta);

    // Check StockLevel
    const stockLevel = await prisma.stockLevel.findUnique({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: location.id,
        },
      },
    });
    expect(stockLevel.quantity).toBe(delta);

    // Duplicate movement is idempotent
    const dup = await request(app)
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${token}`)
      .send({
        movementUuid,
        productId: product.id,
        locationId: location.id,
        delta,
        reason,
      });
    expect(dup.status).toBe(201);

    const stockLevelAfter = await prisma.stockLevel.findUnique({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: location.id,
        },
      },
    });
    expect(stockLevelAfter.quantity).toBe(delta); // no double increment
  });
});
