
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    // When running in a Google Cloud environment, the credentials are
    // automatically available.
  });
}

export const db = admin.firestore();
