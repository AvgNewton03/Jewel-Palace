import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { protectUser } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_YourKeyID",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YourKeySecret",
});

// @route   POST /api/payments/order
// @desc    Create a Razorpay order
// @access  Private
router.post("/order", protectUser, async (req, res) => {
  try {
    const { amount, items } = req.body;

    if (!amount || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid amount or items" });
    }

    const options = {
      amount: parseInt(amount) * 100, // Razorpay works in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Some error occurred with Razorpay" });
    }

    // Save initial pending order to database
    const newOrder = new Order({
      user: req.user._id,
      items: items.map((item) => ({
        title: item.title || item.name,
        qty: item.quantity,
        price: item.price,
        product: item.id,
      })),
      totalAmount: amount,
      status: "pending",
      razorpayOrderId: order.id,
    });

    await newOrder.save();

    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ message: error.message || "Failed to create order" });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature
// @access  Private
router.post("/verify", protectUser, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required payment parameters" });
    }

    // Creating our own digest
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YourKeySecret");
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment is successful, update order in db
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      
      if (order) {
        order.status = "paid";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();
        res.json({ message: "Payment verified successfully", success: true });
      } else {
        res.status(404).json({ message: "Order not found", success: false });
      }
    } else {
      // Payment failed
      res.status(400).json({ message: "Invalid Signature, payment failed", success: false });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ message: error.message || "Failed to verify payment" });
  }
});

export default router;
