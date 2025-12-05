"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
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
    return { firebaseApp, auth, db };
  }

  try {
    const config = loadConfig();

    if (!getApps().length) {
      firebaseApp = initializeApp(config);
      auth = getAuth(firebaseApp);
      db = getFirestore(firebaseApp);
    }
  } catch (error) {
    initError = error as Error;
  }

  return { firebaseApp, auth, db };
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

const ensureAuth = () => {
  const { auth: currentAuth } = initFirebase();
  if (initError) throw initError;
  if (!currentAuth) {
    throw new Error(
      "Firebase Auth não foi inicializado. Confirme se as variáveis de ambiente estão definidas e se o código executa no cliente."
    );
  }
  return currentAuth;
};

initFirebase();

export { initFirebase, ensureAuth, ensureDb };
export type { FirebaseApp, Auth, Firestore };
export default {
  get app() {
    return firebaseApp;
  },
  get auth() {
    return auth;
  },
  get db() {
    return db;
  },
};
