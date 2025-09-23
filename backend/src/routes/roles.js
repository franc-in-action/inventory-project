import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const roles = ["Admin", "Manager", "Staff"].map((role, i) => ({
    id: i + 1,
    roleName: role,
  }));
  res.json(roles);
});

export default router;
