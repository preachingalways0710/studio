// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "studio-6494355702-581e6",
  "appId": "1:403606666583:web:d1f3c8d9e28f7e7421d212",
  "storageBucket": "studio-6494355702-581e6.firebasestorage.app",
  "apiKey": "AIzaSyD_9qflTHgthrxHqONQdRnkMxpHE9UvhiE",
  "authDomain": "studio-6494355702-581e6.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "403606666583"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
