import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyD87UM-tAmEnztl2p2pJ1Z-ob904ilab0U",
  authDomain: "kgluxe.firebaseapp.com",
  projectId: "kgluxe",
  storageBucket: "kgluxe.firebasestorage.app",
  messagingSenderId: "652289207965",
  appId: "1:652289207965:web:ba28d40bb21755f4d06e74",
  measurementId: "G-GGX15HL03X"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);