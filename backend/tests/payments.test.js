import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { setupTestDB, teardownTestDB } from "./utils/testSetup.js";

describe("Payments & Customer Credit Flow", () => {
  let token, customer, location, product, sale, creditTestProduct;

  beforeAll(async () => {
    const setup = await setupTestDB();
    token = setup.token;
    location = setup.location;

    // Create customer
    customer = await prisma.customer.create({
      data: { name: "Credit Cust", balance: 0, credit_limit: 500 },
    });

    // Product for normal sales
    product = await prisma.product.create({
      data: {
        sku: "CR001",
        name: "Credit Product",
        price: 100,
        quantity: 10,
        locationId: location.id,
      },
    });

    await prisma.stockLevel.upsert({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: location.id,
        },
      },
      update: {},
      create: { productId: product.id, locationId: location.id, quantity: 10 },
    });

    // Product with sufficient stock for credit limit test
    creditTestProduct = await prisma.product.create({
      data: {
        sku: "CR002",
        name: "Credit Test Product",
        price: 100,
        quantity: 20,
        locationId: location.id,
      },
    });

    await prisma.stockLevel.upsert({
      where: {
        productId_locationId: {
          productId: creditTestProduct.id,
          locationId: location.id,
        },
      },
      update: {},
      create: {
        productId: creditTestProduct.id,
        locationId: location.id,
        quantity: 20,
      },
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test("Create sale on credit increments customer balance", async () => {
    const saleData = {
      locationId: location.id,
      customerId: customer.id,
      items: [{ productId: product.id, qty: 3, price: 100 }],
    };

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send(saleData);

    expect(res.status).toBe(201);

    sale = res.body; // save sale for payment tests

    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
    });
    expect(updatedCustomer.balance).toBe(300);
  });

  test("Post payment (customerId only) reduces balance", async () => {
    const paymentData = {
      customerId: customer.id,
      amount: 100,
      method: "CASH",
    };

    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send(paymentData);

    expect(res.status).toBe(201);

    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
    });
    expect(updatedCustomer.balance).toBe(200);
  });

  test("Post payment linked to a sale reduces customer balance", async () => {
    const paymentData = {
      customerId: customer.id,
      saleId: sale.id,
      amount: 50,
      method: "CARD",
    };

    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send(paymentData);

    expect(res.status).toBe(201);

    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
    });
    expect(updatedCustomer.balance).toBe(150);
  });

  test("Cannot create sale exceeding credit limit", async () => {
    const saleData = {
      locationId: location.id,
      customerId: customer.id,
      items: [{ productId: creditTestProduct.id, qty: 10, price: 100 }],
    };

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send(saleData);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Credit limit exceeded/);
  });
});
