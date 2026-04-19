// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2M6MBlsaDuyJjPWKRMtYvpo6ffqSo4T8",
  authDomain: "hireready-eb384.firebaseapp.com",
  projectId: "hireready-eb384",
  storageBucket: "hireready-eb384.firebasestorage.app",
  messagingSenderId: "127641848185",
  appId: "1:127641848185:web:36b26d401f6cfb609247a8",
  measurementId: "G-N9NGL50WZ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
