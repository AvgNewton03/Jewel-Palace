import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
       // Fallback: Look for the local credentials file
       const localKeyPath = path.join(__dirname, '../jewelpalace-firebase-adminsdk-fbsvc-4f98306e5f.json');
       if (fs.existsSync(localKeyPath)) {
         const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
         admin.initializeApp({
           credential: admin.credential.cert(serviceAccount)
         });
         console.log('Firebase Admin initialized with local JSON file.');
       } else {
         // Fallback: This tries to use Application Default Credentials if running in GC
         admin.initializeApp();
         console.log('Firebase Admin initialized with Application Default Credentials.');
       }
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export default admin;
