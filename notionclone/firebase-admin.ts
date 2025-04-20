import { credential } from "firebase-admin";
import { initializeApp, App, getApp, getApps, cert } from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT;

if(!serviceAccountBase64) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is not defined");
}
let app: App;

const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccount), 
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };
