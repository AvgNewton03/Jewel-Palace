import mongoose from "../backend/node_modules/mongoose/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env if not already in process.env
let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  try {
    const envPath = path.join(__dirname, "../.env");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);
    if (match) MONGODB_URI = match[1];
  } catch (e) {}
}

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI is not defined in .env");
  process.exit(1);
}

const targetEmail = process.argv[2] || "deepamsipani3@gmail.com";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { strict: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function promote() {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);

    const user = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase().trim() },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (user) {
      console.log(`✅ Success! User [${user.email}] has been promoted to role: "${user.role}"`);
    } else {
      console.log(`⚠️ User with email [${targetEmail}] not found in database.`);
    }
  } catch (error) {
    console.error("❌ Error during admin promotion:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

promote();
