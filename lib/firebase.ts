import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2HyPW7Vp6pO_j-IEQSVcWuWkTqGvdZwk",
  authDomain: "tung-blog.firebaseapp.com",
  projectId: "tung-blog",
  storageBucket: "tung-blog.firebasestorage.app",
  messagingSenderId: "736038892248",
  appId: "1:736038892248:web:2cce76d77f3bf6cc859dad",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
