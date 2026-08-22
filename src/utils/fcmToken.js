import axios from 'axios';
import { messaging, getToken } from '../config/firebase';
import apiEndpoints from '../redux/apiEndpoint';

export const getFCMToken = async () => {
  try {
    if (!messaging || typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('[FCM] Push Notification is not supported in this browser environment.');
      return null;
    }

    const permission = Notification.permission === 'granted' 
      ? 'granted' 
      : await Notification.requestPermission();
      
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission was denied or dismissed:', permission);
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined;
    if (!vapidKey) {
      console.warn('[FCM] VITE_FIREBASE_VAPID_KEY is missing in frontend/.env file. Firebase requires a Web Push VAPID Key to generate device tokens.');
    }

    const currentFcmToken = await getToken(messaging, {
      ...(vapidKey ? { vapidKey } : {})
    }).catch((e) => {
      console.warn('[FCM] getToken error:', e);
      return null;
    });

    return currentFcmToken || null;
  } catch (err) {
    console.warn('[FCM] Get FCM token error:', err);
  }
  return null;
};

export const registerFCMToken = async (token) => {
  if (!token) return;
  try {
    const currentFcmToken = await getFCMToken();
    if (currentFcmToken) {
      console.log('[FCM] Sending token to backend:', currentFcmToken);
      const res = await axios.put(
        apiEndpoints.common.fcmToken,
        { fcmToken: currentFcmToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('[FCM] Token registered successfully on backend:', res.data);
    } else {
      console.warn('[FCM] Skipping backend registration because FCM device token is null.');
    }
  } catch (err) {
    console.warn('[FCM] Failed to register FCM token on backend:', err);
  }
};
