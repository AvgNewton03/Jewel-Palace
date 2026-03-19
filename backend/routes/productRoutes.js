import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();
// Configuration for Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to safely parse JSON arrays from FormData
const parseArrayField = (field) => {
  if (!field) return [];
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    return [field];
  }
};

// GET /api/products - Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// All routes require authentication
router.use(protect);

// POST route /api/products/add
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { title, price, category, occasion, color } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required." });
    }

    // Convert buffer to base64 so cloudinary can upload it from memory
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "jewelry_manager_products",
      resource_type: "auto",
    });

    const parsedCategory = parseArrayField(category);
    const parsedOccasion = parseArrayField(occasion);
    const parsedColor = parseArrayField(color);

    // Create and save the new product in MongoDB
    const newProduct = new Product({
      title,
      price: Number(price),
      category: parsedCategory.length > 0 ? parsedCategory : ["Uncategorized"],
      occasion: parsedOccasion,
      color: parsedColor,
      imageUrl: uploadResponse.secure_url,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to upload image and add product" });
  }
});

// PUT /api/products/:id - Update product (e.g. visibility)
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = req.body.title || product.title;
      product.price = req.body.price || product.price;
      
      if (req.body.category) product.category = parseArrayField(req.body.category);
      if (req.body.occasion) product.occasion = parseArrayField(req.body.occasion);
      if (req.body.color) product.color = parseArrayField(req.body.color);

      if (req.body.isVisible !== undefined) {
        product.isVisible = req.body.isVisible;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
