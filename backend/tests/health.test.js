import request from "supertest";
import app from "../src/app.js";   // ⬅️ same here

test("health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
});
