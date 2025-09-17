import request from "supertest";
import app from "../src/app.js";   // ⬅️ use app.js, not server.js
import { prisma } from "../src/prisma.js";
import bcrypt from "bcrypt";

beforeAll(async () => {
    await prisma.user.deleteMany();
    const hashed = await bcrypt.hash("password123", 10);
    await prisma.user.create({
        data: {
            email: "admin@example.com",
            password: hashed,
            name: "Admin",
            role: "ADMIN",
        },
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Auth Flow", () => {
    test("Login works and returns token", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "admin@example.com", password: "password123" });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test("Access protected route with token", async () => {
        const login = await request(app)
            .post("/api/auth/login")
            .send({ email: "admin@example.com", password: "password123" });

        const token = login.body.token;
        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Rejects request without token", async () => {
        const res = await request(app).get("/api/users");
        expect(res.statusCode).toBe(401);
    });
});
