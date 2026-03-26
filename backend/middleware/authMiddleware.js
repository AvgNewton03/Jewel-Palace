import jwt from 'jsonwebtoken';
import admin from '../firebaseAdmin.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verify it's an admin token (our payload will be simple)
      if (decoded.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized, admin only' });
      }

      req.admin = decoded; // Store admin info in request
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const protectUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      const User = (await import('../models/User.js')).default;
      req.user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      // We also set firebaseUser in case req.user doesn't exist yet (before sync)
      req.firebaseUser = decodedToken;

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect, protectUser };
