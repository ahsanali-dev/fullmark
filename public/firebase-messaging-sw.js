// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBB_87iTYF6-N0WolrRvpiAr15PVxeZgjk",
  authDomain: "fullmark-c72f7.firebaseapp.com",
  projectId: "fullmark-c72f7",
  storageBucket: "fullmark-c72f7.firebasestorage.app",
  messagingSenderId: "446929874415",
  appId: "1:446929874415:web:d421428b10762572989a1a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'FullMark Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
