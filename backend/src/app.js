// src/app.js

import express from "express";
import bodyParser from "body-parser";
import cors from "cors"; // <--- add this
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productsRouter from "./routes/products.js";

const app = express();

// Enable CORS for frontend dev server
app.use(cors({
    origin: "http://localhost:5144", // match your Vite frontend port
    credentials: true
}));

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
