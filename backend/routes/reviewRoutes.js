import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all visible reviews
// @access  Public
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find({ isVisible: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const review = new Review({
      name,
      rating,
      comment,
      isVisible: true,
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
