// FIX: Use Firebase v9 compat API instead of v9 modular imports.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';

// IMPORTANT: Replace with your actual Firebase project configuration.
// These values can be found in your Firebase project settings under "General".
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API Key
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your Firebase Auth Domain
  projectId: "YOUR_PROJECT_ID", // Replace with your Firebase Project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your Firebase Storage Bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Firebase Messaging Sender ID
  appId: "YOUR_APP_ID", // Replace with your Firebase App ID
  measurementId: "YOUR_MEASUREMENT_ID" // Optional: Replace with your Firebase Measurement ID
};

// Initialize Firebase
// FIX: Use v8 compat API and check for existing apps to prevent re-initialization.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize and export Firebase services
// FIX: Use v8 compat API.
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();

// Conditionally initialize Analytics if supported by the browser
// FIX: Use v8 compat API for analytics.
export const analytics = firebase.analytics.isSupported().then(yes => yes ? firebase.analytics() : null);