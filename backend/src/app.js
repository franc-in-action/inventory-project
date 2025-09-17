import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productsRouter from "./routes/products.js";

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/products", productsRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ ok: true, time: new Date() });
});

export default app;
