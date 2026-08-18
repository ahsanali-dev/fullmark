import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBB_87iTYF6-N0WolrRvpiAr15PVxeZgjk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fullmark-c72f7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fullmark-c72f7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fullmark-c72f7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "446929874415",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:446929874415:web:d421428b10762572989a1a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8Q9RXKYRR4"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn('Firebase Messaging not supported in this environment:', err);
  }
}

export { app, analytics, messaging, getToken, onMessage };
