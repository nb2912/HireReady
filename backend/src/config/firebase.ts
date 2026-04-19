import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path'; // Import the path module

dotenv.config();

// TODO: Replace with your actual Firebase service account key path
// For local development, you can point to a downloaded JSON file.
// For deployment, consider using environment variables for credentials.
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

let serviceAccount;
if (serviceAccountPath) {
  // Resolve path relative to the project root
  serviceAccount = require(path.join(process.cwd(), serviceAccountPath));
} else {
  // Fallback path relative to the firebase.js file (dist/config/firebase.js -> ../../serviceAccountKey.json)
  serviceAccount = require(path.join(__dirname, '..', '..', 'serviceAccountKey.json'));
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
