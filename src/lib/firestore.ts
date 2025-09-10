'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, experimentalForceLongPolling } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'studio-6494355702-581e6',
  appId: '1:403606666583:web:d1f3c8d9e28f7e7421d212',
  storageBucket: 'studio-6494355702-581e6.firebasestorage.app',
  apiKey: 'AIzaSyD_9qflTHgthrxHqONQdRnkMxpHE9UvhiE',
  authDomain: 'studio-6494355702-581e6.firebaseapp.com',
  messagingSenderId: '403606666583',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app, {
  experimentalForceLongPolling: true,
});


export { db, auth };
