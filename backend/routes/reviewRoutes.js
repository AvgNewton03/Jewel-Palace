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

// @route   GET /api/reviews/all
// @desc    Get all reviews (for Admin)
// @access  Public (in production, should be protected)
router.get("/all", async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
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

// @route   PUT /api/reviews/:id/visibility
// @desc    Toggle review visibility
// @access  Public (in production, should be protected)
router.put("/:id/visibility", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isVisible = !review.isVisible;
    const updatedReview = await review.save();

    res.json(updatedReview);
  } catch (error) {
    console.error("Error toggling review visibility:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
