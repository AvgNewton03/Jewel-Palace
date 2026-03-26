import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Default app can be initialized if needed, but since we may be initializing with service account, 
// checking if already initialized prevents hot-reloading errors.
if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountString) {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Fallback: This tries to use Application Default Credentials if running in GC
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export default admin;
