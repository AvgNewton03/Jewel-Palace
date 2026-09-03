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
      return res.status(401).json({ 
        message: 'Not authorized, token failed', 
        error: error.message,
        code: error.code
      });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const requireAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied: No token provided.' });
  }

  try {
    // 1. Check if token is a direct Admin JWT (from /api/admin/login)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
      if (decoded && decoded.role === 'admin') {
        req.admin = decoded;
        req.user = { _id: decoded.id, role: 'admin' };
        return next();
      }
    } catch (jwtErr) {
      // Not a standard JWT; continue to Firebase token verification
    }

    // 2. Check if token is a Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const User = (await import('../models/User.js')).default;
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (user && user.role === 'admin') {
      req.user = user;
      req.firebaseUser = decodedToken;
      return next();
    }

    // Direct match by verified email
    if (decodedToken.email === 'deepamsipani3@gmail.com') {
      req.user = user || { email: decodedToken.email, role: 'admin' };
      req.firebaseUser = decodedToken;
      return next();
    }

    return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
  } catch (error) {
    console.error("requireAdmin error:", error);
    return res.status(403).json({ error: 'Access denied: Invalid or expired authorization token.' });
  }
};

export { protect, protectUser, requireAdmin };

