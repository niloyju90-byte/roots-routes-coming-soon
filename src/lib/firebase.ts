import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Client-side Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDMJ8J6FbhBeyspWAHbi1cjetSp6f_WeVw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "roots-routes-coming-soon.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "roots-routes-coming-soon",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "roots-routes-coming-soon.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "17031866415",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:17031866415:web:4a52f146d86ac8510ebeda",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key' && 
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id'
);

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization error, fallback storage active:', error);
  }
}

export { app, db };
