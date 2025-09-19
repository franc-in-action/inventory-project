// tests/sync.test.js
import request from "supertest";
import { prisma } from "../src/prisma.js";
import app from "../src/app.js";
import { setupTestDB, teardownTestDB } from "./utils/testSetup.js";

describe("Sync endpoints", () => {
  let token, location;

  beforeAll(async () => {
    const setup = await setupTestDB();
    token = setup.token;
    location = setup.location;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test("Push deduplicates append-only entities", async () => {
    const saleUuid = "sale-123";
    const salePayload = {
      uuid: saleUuid, // ✅ added for deduplication check
      total: 100,
      customerId: 1,
      locationId: location.id,
    };

    // First push
    const res1 = await request(app)
      .post("/api/sync/push")
      .set("Authorization", `Bearer ${token}`)
      .send({
        changes: [
          { entityType: "Sale", entityUuid: saleUuid, payload: salePayload },
        ],
      });

    expect(res1.status).toBe(200);
    expect(res1.body.results[0].clientUuid).toBe(saleUuid);

    // Duplicate push
    const res2 = await request(app)
      .post("/api/sync/push")
      .set("Authorization", `Bearer ${token}`)
      .send({
        changes: [
          { entityType: "Sale", entityUuid: saleUuid, payload: salePayload },
        ],
      });

    expect(res2.status).toBe(200);
    expect(res2.body.results[0].serverId).toBe(res1.body.results[0].serverId);
  });

  test("Product update returns 409 on conflict", async () => {
    const product = await prisma.product.create({
      data: {
        id: "prod1",
        name: "Test Product",
        sku: "SKU1",
        price: 50,
        quantity: 10,
        locationId: location.id,
      },
    });

    const conflictingPayload = {
      ...product,
      name: "Updated Name",
      updatedAt: new Date(Date.now() - 10000).toISOString(),
    };

    const res = await request(app)
      .post("/api/sync/push")
      .set("Authorization", `Bearer ${token}`)
      .send({
        changes: [
          {
            entityType: "Product",
            entityUuid: "prod-uuid",
            payload: conflictingPayload,
          },
        ],
      });

    expect(res.status).toBe(409);
    expect(res.body.serverSnapshot.id).toBe(product.id);
  });

  test("Pull returns server changes since given seq", async () => {
    const res = await request(app)
      .get("/api/sync/pull?since_seq=0")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.changes).toBeInstanceOf(Array);

    // ✅ convert serverSeq to number for comparison
    expect(Number(res.body.serverSeq)).toBeGreaterThanOrEqual(0);
  });

  test("Multi-device sync simulation", async () => {
    const saleUuid = "sale-multi-1";
    const salePayload = {
      uuid: saleUuid,
      total: 200,
      customerId: 1,
      locationId: location.id,
    };

    // Device A pushes
    const resA1 = await request(app)
      .post("/api/sync/push")
      .set("Authorization", `Bearer ${token}`)
      .send({
        changes: [
          { entityType: "Sale", entityUuid: saleUuid, payload: salePayload },
        ],
      });

    expect(resA1.status).toBe(200);

    // Device B pushes the same sale later
    const resB1 = await request(app)
      .post("/api/sync/push")
      .set("Authorization", `Bearer ${token}`)
      .send({
        changes: [
          { entityType: "Sale", entityUuid: saleUuid, payload: salePayload },
        ],
      });

    // Should dedupe
    expect(resB1.body.results[0].serverId).toBe(resA1.body.results[0].serverId);

    // Device B pulls changes since 0
    const pullB = await request(app)
      .get("/api/sync/pull?since_seq=0")
      .set("Authorization", `Bearer ${token}`);

    expect(pullB.status).toBe(200);
    expect(pullB.body.changes.length).toBeGreaterThanOrEqual(1);

    // Simulate conflicting product updates
    const product = await prisma.product.create({
      data: {
        id: "prod-multi",
        name: "Multi Product",
        sku: "MP001",
        price: 100,
        quantity: 5,
        locationId: location.id,
      },
    });

    // Device A updates product
    const updateA = {
      ...product,
      price: 120,
      updatedAt: new Date().toISOString(),
    };
    await request(app)
      .post("/api/sync/push")
      .set("Authorization", `Bearer ${token}`)
      .send({
        changes: [
          {
            entityType: "Product",
            entityUuid: "prod-multi-a",
            payload: updateA,
          },
        ],
      });

    // Device B tries to update same product with old updatedAt
    const updateB = {
      ...product,
      price: 130,
      updatedAt: new Date(Date.now() - 10000).toISOString(),
    };
    const resConflict = await request(app)
      .post("/api/sync/push")
      .set("Authorization", `Bearer ${token}`)
      .send({
        changes: [
          {
            entityType: "Product",
            entityUuid: "prod-multi-b",
            payload: updateB,
          },
        ],
      });

    expect(resConflict.status).toBe(409);
    expect(resConflict.body.serverSnapshot.id).toBe(product.id);
  });
});
