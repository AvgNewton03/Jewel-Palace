import { initializeApp, getApps, cert } from 'firebase-admin/app';
import path from 'path';
import fs from 'fs';

export const initAdmin = () => {
  if (!getApps().length) {
    try {
      const serviceAccountPath = path.join(process.cwd(), 'jewelpalace-firebase-adminsdk-fbsvc-4f98306e5f.json');
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        initializeApp({
          credential: cert(serviceAccount),
        });
        console.log('Firebase Admin Initialized successfully.');
      } else {
        console.warn('Firebase Admin SDK service account key not found at path:', serviceAccountPath);
      }
    } catch (error) {
      console.error('Firebase Admin Initialization Error:', error);
    }
  }
};
