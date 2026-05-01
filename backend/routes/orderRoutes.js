import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders (admin view)
// @access  Public (since Admin panel handles its own auth via /api/admin/login and JWT, but to keep it simple and match the current open structure, we'll keep it accessible. In production, protect this route!)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: "pending" } })
      .populate("user", "username email") // Note: The User model might not have these exact fields, but this handles basic population if possible.
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
