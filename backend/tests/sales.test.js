import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { setupTestDB, teardownTestDB } from "./utils/testSetup.js";

describe("Sales Flow", () => {
  let token, customer, location, product;

  beforeAll(async () => {
    const setup = await setupTestDB();
    token = setup.token;
    location = setup.location;

    // Seed a customer
    customer = await prisma.customer.create({
      data: { name: "Test Customer", balance: 1000 },
    });

    // Seed a product
    product = await prisma.product.create({
      data: {
        sku: "S001",
        name: "Sale Product",
        price: 50,
        quantity: 20, // per schema
        locationId: location.id, // required relation
      },
    });

    // Seed stock level
    await prisma.stockLevel.upsert({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: location.id,
        },
      },
      update: {},
      create: { productId: product.id, locationId: location.id, quantity: 20 },
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test("Create sale decrements stock and records payment", async () => {
    const saleData = {
      locationId: location.id,
      customerId: customer.id,
      items: [{ productId: product.id, qty: 5, price: 50 }],
      payment: { amount: 250, method: "CASH" },
    };

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send(saleData);

    expect(res.status).toBe(201);

    // Verify stock updated
    const stockLevel = await prisma.stockLevel.findUnique({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: location.id,
        },
      },
    });
    expect(stockLevel.quantity).toBe(15);

    // Verify sale items
    const saleItems = await prisma.saleItem.findMany({
      where: { saleId: res.body.id },
    });
    expect(saleItems.length).toBe(1);
    expect(saleItems[0].qty).toBe(5);

    // Verify payment recorded
    const payments = await prisma.payment.findMany({
      where: { saleId: res.body.id },
    });
    expect(payments[0].amount).toBe(250);
  });

  test("Cannot oversell if stock policy forbids negative", async () => {
    const saleData = {
      locationId: location.id,
      customerId: customer.id,
      items: [{ productId: product.id, qty: 1000, price: 50 }],
    };

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send(saleData);

    expect(res.status).toBe(400);
  });
});
