import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCZR9U6W9uZJUylyPfG3YI6oXTXBxAA7rw",
  authDomain: "unihack-19282.firebaseapp.com",
  projectId: "unihack-19282",
  storageBucket: "unihack-19282.firebasestorage.app",
  messagingSenderId: "898238309422",
  appId: "1:898238309422:web:6cc622920ba009acc16bbf",
  measurementId: "G-NS465W7HV4"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
