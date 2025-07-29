// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_WQ52u74sNqG_PZzJg6LpTotp8V2i7hY",
  authDomain: "ecoquest-79b2b.firebaseapp.com",
  databaseURL: "https://ecoquest-79b2b-default-rtdb.firebaseio.com",
  projectId: "ecoquest-79b2b",
  storageBucket: "ecoquest-79b2b.firebasestorage.app",
  messagingSenderId: "357870057922",
  appId: "1:357870057922:web:dbe6f1362ac8b763697e5b",
  measurementId: "G-MEP974SDVJ"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const database = getDatabase(app);
const storage = getStorage(app);

export { app, auth, database, storage };