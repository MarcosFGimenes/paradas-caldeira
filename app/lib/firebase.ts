"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;
let initError: Error | null = null;

const loadConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  } as const;

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(
      `Configuração do Firebase ausente: defina ${missing.join(", ")} no ambiente.`
    );
  }

  return config;
};

const initFirebase = () => {
  if (firebaseApp || typeof window === "undefined") {
    return { firebaseApp, db };
  }

  try {
    const config = loadConfig();

    if (!getApps().length) {
      firebaseApp = initializeApp(config);
      db = initializeFirestore(firebaseApp, {
        experimentalAutoDetectLongPolling: true,
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
    }
  } catch (error) {
    initError = error as Error;
  }

  return { firebaseApp, db };
};

const ensureDb = () => {
  const { db: currentDb } = initFirebase();
  if (initError) throw initError;
  if (!currentDb) {
    throw new Error(
      "Firebase não foi inicializado. Verifique se este código está sendo executado no cliente e se as variáveis de ambiente estão configuradas."
    );
  }
  return currentDb;
};

initFirebase();

export { initFirebase, ensureDb };
export type { FirebaseApp, Firestore };
export default {
  get app() {
    return firebaseApp;
  },
  get db() {
    return db;
  },
};
