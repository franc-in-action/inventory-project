// src/app.js

import express from "express";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import cors from "cors";

// Keep your individual route imports
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import rolesRouter from "./routes/roles.js";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import stockRouter from "./routes/stock.js";
import salesRouter from "./routes/sales.js";
import purchasesRouter from "./routes/purchases.js";
import customersRouter from "./routes/customers.js";
import vendorsRouter from "./routes/vendors.js";
import issuedPaymentsRouter from "./routes/issuedPayments.js";
import paymentsRouter from "./routes/payments.js";
import returnsRouter from "./routes/returns.js"; // NEW
import adjustmentsRouter from "./routes/adjustments.js"; // NEW
import syncRouter from "./routes/sync.js";
import locationsRouter from "./routes/locations.js";
import logsRouter from "./routes/logs.js";
import adminRouter from "./routes/admin.js";

const app = express();

// Enable CORS for frontend dev server
app.use(
  cors({
    origin: "http://localhost:5144",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Add this BEFORE your routes
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", rolesRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/stock", stockRouter);
app.use("/api/sales", salesRouter);
app.use("/api/purchases", purchasesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/issuedpayments", issuedPaymentsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/returns", returnsRouter); // NEW
app.use("/api/adjustments", adjustmentsRouter); // NEW
app.use("/api/sync", syncRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/admin", adminRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date() });
});

export default app;
