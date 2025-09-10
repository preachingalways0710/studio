import { config } from 'dotenv';
config();

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = {
  "projectId": "studio-6494355702-581e6",
  "privateKey": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "clientEmail": "firebase-adminsdk-3y9jp@studio-6494355702-581e6.iam.gserviceaccount.com"
};

const apps = getApps();
if (!apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
  });
}

export const db = getFirestore();
export const authAdmin = getAuth();
