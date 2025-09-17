import request from "supertest";
import bcrypt from "bcrypt";
import { prisma } from "../../src/prisma.js";
import app from "../../src/app.js";

export async function setupTestDB() {
  let token;
  let location;

  try {
    console.log("Clearing test database...");
    await prisma.saleItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.stockLevel.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.location.deleteMany();
    await prisma.category.deleteMany();
    await prisma.customer.deleteMany();

    console.log("Seeding test location...");
    location = await prisma.location.create({
      data: { name: "Main Branch", address: "Downtown" },
    });

    console.log("Seeding admin user...");
    const hashed = await bcrypt.hash("password", 10);
    await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: hashed,
        name: "System Admin",
        role: "ADMIN",
        locationId: location.id,
      },
    });

    console.log("Logging in admin user...");
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password" });

    if (!res.body.token) {
      console.error("Login failed in tests:", res.body);
      throw new Error("Test admin login failed");
    }

    token = res.body.token;
    console.log("Admin login successful. Token obtained.");
  } catch (err) {
    console.error("Error in test setup:", err);
    throw err;
  }

  return { token, location };
}

export async function teardownTestDB() {
  await prisma.$disconnect();
}
