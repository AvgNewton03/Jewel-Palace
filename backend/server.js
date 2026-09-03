import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// Middleware
const allowedOrigins = [
  "https://jewelpalacemumbai.com",
  "https://www.jewelpalacemumbai.com",
  "https://admin.jewelpalacemumbai.com",
  "http://localhost:3000",
  "http://admin.localhost:3000",
  "http://127.0.0.1:3000",
  "http://admin.127.0.0.1:3000",
  "https://jewel-palace.pages.dev",
  "https://jewel-palace.onrender.com",
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  // Direct whitelist match
  if (allowedOrigins.includes(origin)) return true;

  // Regex matching subdomains of jewelpalacemumbai.com
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*jewelpalacemumbai\.com$/.test(origin)) {
    return true;
  }

  // Regex matching localhost / 127.0.0.1 on any port with any subdomain
  if (/^http:\/\/([a-zA-Z0-9-]+\.)*localhost(:\d+)?$/.test(origin)) {
    return true;
  }
  if (/^http:\/\/([a-zA-Z0-9-]+\.)*127\.0\.0\.1(:\d+)?$/.test(origin)) {
    return true;
  }

  // Cloudflare Pages & Render preview subdomains
  if (
    origin.endsWith(".jewel-palace.pages.dev") ||
    origin.endsWith(".pages.dev") ||
    origin.endsWith(".onrender.com")
  ) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable");
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB successfully.");
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to connect to MongoDB", error);
    });
}
