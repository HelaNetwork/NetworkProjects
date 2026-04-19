import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC649mpDW8c-k5YN-tk2B4kqLAwj8aNWVE",
  authDomain: "hela-paystream.firebaseapp.com",
  projectId: "hela-paystream",
  storageBucket: "hela-paystream.firebasestorage.app",
  messagingSenderId: "906432651964",
  appId: "1:906432651964:web:8b4cd7d1d1ac9813f526b9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
