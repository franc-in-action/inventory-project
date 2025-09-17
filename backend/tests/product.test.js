import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";
import bcrypt from "bcrypt";

describe("Products API", () => {
    let token;
    let location;

    beforeAll(async () => {
        try {
            console.log("Clearing test database...");
            await prisma.product.deleteMany();
            await prisma.user.deleteMany();
            await prisma.location.deleteMany();
            await prisma.category.deleteMany();

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
            console.error("Error in beforeAll:", err);
            throw err;
        }
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should create a product", async () => {
        try {
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
        } catch (err) {
            console.error("Error creating product:", err);
            throw err;
        }
    });

    it("should list products", async () => {
        try {
            const res = await request(app)
                .get("/api/products")
                .set("Authorization", `Bearer ${token}`);

            if (res.status !== 200) console.error("Product listing failed:", res.body);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
        } catch (err) {
            console.error("Error listing products:", err);
            throw err;
        }
    });

    it("should update a product", async () => {
        try {
            const product = await prisma.product.findFirst();
            if (!product) {
                console.error("No product found to update.");
                throw new Error("Product not found");
            }

            const res = await request(app)
                .put(`/api/products/${product.id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Updated Name" });

            if (res.status !== 200) console.error("Product update failed:", res.body);

            expect(res.status).toBe(200);
            expect(res.body.name).toBe("Updated Name");
        } catch (err) {
            console.error("Error updating product:", err);
            throw err;
        }
    });

    it("should delete a product", async () => {
        try {
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

            const deleted = await prisma.product.findUnique({ where: { id: product.id } });
            expect(deleted).toBeNull();
        } catch (err) {
            console.error("Error deleting product:", err);
            throw err;
        }
    });
});
