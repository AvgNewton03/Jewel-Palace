import express from "express";
import {
  syncUser,
  getUserProfile,
  addWishlist,
  removeWishlist
} from "../controllers/userController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sync", protectUser, syncUser);
router.get("/profile", protectUser, getUserProfile);
router.post("/wishlist/:id", protectUser, addWishlist);
router.delete("/wishlist/:id", protectUser, removeWishlist);

export default router;
