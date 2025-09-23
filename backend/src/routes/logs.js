import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  // Example log entries
  const logs = [
    { id: 1, action: "User login", userName: "Alice", createdAt: new Date() },
    { id: 2, action: "User logout", userName: "Bob", createdAt: new Date() },
  ];
  res.json({ logs }); // return as object
});

export default router;
