import express from "express";
import Order from "../models/Order.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/orders or /api/admin/orders
// @desc    Get all orders (admin view)
// @access  Private (Admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: "pending" } })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;

