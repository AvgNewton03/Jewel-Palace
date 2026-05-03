import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const initAdmin = () => {
  if (!getApps().length) {
    try {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables.');
        return;
      }
      
      // Parse the JSON string from the environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      // Ensure the private key is formatted correctly (Vercel often escapes newlines)
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin Initialized successfully using environment variables.');
    } catch (error) {
      console.error('Firebase Admin Initialization Error:', error);
    }
  }
};
