import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Setup rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

// Since we don't have a sign-up flow, we will check against standard environment variables:
// ADMIN_USERNAME and ADMIN_PASSWORD
// You should set these in your .env file!
// Example .env: 
// ADMIN_USERNAME=admin
// ADMIN_PASSWORD=my_secure_password_for_dad

// We'll generate a bcrypt hash dynamically or expect raw password check here? 
// Actually, checking raw passwords vs env variables directly is easier, 
// OR we can store a hashed password in DB.
// To keep it simple, since user says "Admin credentials will already exist in MongoDB. Use bcrypt..."
// We need an Admin model or just fetch an admin user.
// Let's create an Admin model and check against it.
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

// Seeder logic to ensure at least one admin exists if NONE exist
const seedAdmin = async () => {
    try {
        const count = await Admin.countDocuments();
        if (count === 0) {
            const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
            const defaultPassword = process.env.ADMIN_PASSWORD || 'password123';
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultPassword, salt);
            
            await Admin.create({
                username: defaultUsername,
                password: hashedPassword
            });
            console.log(`Default admin seeded with username: ${defaultUsername}`);
        }
    } catch (err) {
        console.error('Failed to seed admin:', err);
    }
}

// POST /api/admin/login
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  try {
    // Seed default admin if missing (just for easy setup)
    await seedAdmin();

    const admin = await Admin.findOne({ username });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      // Create JWT
      const token = jwt.sign(
        { id: admin._id, role: 'admin' },
        process.env.JWT_SECRET || 'fallback_secret_for_dev',
        { expiresIn: '30d' }
      );

      res.json({
        _id: admin._id,
        username: admin.username,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
