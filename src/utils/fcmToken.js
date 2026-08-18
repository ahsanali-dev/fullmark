import axios from 'axios';
import { messaging, getToken } from '../config/firebase';
import apiEndpoints from '../redux/apiEndpoint';

export const registerFCMToken = async (token) => {
  if (!token) return;
  try {
    if (!messaging) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined;
      const currentFcmToken = await getToken(messaging, {
        ...(vapidKey ? { vapidKey } : {})
      }).catch((e) => {
        console.warn('FCM getToken error:', e);
        return null;
      });

      if (currentFcmToken) {
        await axios.put(
          apiEndpoints.common.fcmToken,
          { fcmToken: currentFcmToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('FCM Token registered successfully');
      }
    }
  } catch (err) {
    console.warn('Failed to register FCM token:', err);
  }
};
