// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPsiK4ehET39b7sydFFN2mJMmIDCA1qjQ",
  authDomain: "intellihire-dfc73.firebaseapp.com",
  projectId: "intellihire-dfc73",
  storageBucket: "intellihire-dfc73.firebasestorage.app",
  messagingSenderId: "163250090496",
  appId: "1:163250090496:web:cea91b7a7bf983bd461ee5",
  measurementId: "G-18WP3DD8GV"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();



export const auth = getAuth(app);
export const db = getFirestore(app);