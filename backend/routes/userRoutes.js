import express from "express";
import {
  syncUser,
  getUserProfile,
  addWishlist,
  removeWishlist,
  getUserAddresses,
  addAddress,
  deleteAddress,
} from "../controllers/userController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sync", protectUser, syncUser);
router.get("/profile", protectUser, getUserProfile);
router.post("/wishlist/:id", protectUser, addWishlist);
router.delete("/wishlist/:id", protectUser, removeWishlist);

// Address Management
router.post("/address", addAddress);
router.get("/address/:userId", getUserAddresses);
router.get("/address", getUserAddresses);
router.delete("/address/:id", deleteAddress);

export default router;
