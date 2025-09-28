import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { computeVendorBalances } from "../utils/vendorsHelpers.js";

const router = express.Router();

// -------------------- CREATE --------------------
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const { name, email, phone } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
      const vendor = await prisma.vendor.create({
        data: { name, email, phone },
      });
      res.status(201).json(vendor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- READ PAGINATED VENDORS --------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const includeBalance = req.query.includeBalance === "true";

    const [total, vendors] = await prisma.$transaction([
      prisma.vendor.count(),
      prisma.vendor.findMany({
        skip,
        take: pageSize,
        orderBy: { name: "asc" },
      }),
    ]);

    if (includeBalance) {
      const balances = await computeVendorBalances(vendors.map((v) => v.id));
      vendors.forEach((v) => (v.balance = balances[v.id] || 0));
    }

    res.json({
      data: vendors,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- READ SINGLE VENDOR --------------------
router.get("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const includeBalance = req.query.includeBalance === "true";

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { productVendors: { include: { product: true } } },
    });

    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    if (includeBalance) {
      const balances = await computeVendorBalances([id]);
      vendor.balance = balances[id] || 0;
    }

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- UPDATE --------------------
router.put(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    const id = req.params.id;
    const { name, email, phone } = req.body;

    try {
      const vendor = await prisma.vendor.update({
        where: { id },
        data: { name, email, phone },
      });
      res.json(vendor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- DELETE --------------------
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const id = req.params.id;
    try {
      await prisma.vendor.delete({ where: { id } });
      res.json({ message: "Vendor deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// -------------------- GET VENDOR PRODUCTS --------------------
router.get("/:id/products", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const products = await prisma.product.findMany({
      where: { productVendors: { some: { vendorId: id } } },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
