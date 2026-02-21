import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDJgiW8R6jN9eln4sRNVFtE2DvIJq0vKaw",
    authDomain: "thinksmith-first-prin-jyj.firebaseapp.com",
    projectId: "thinksmith-first-prin-jyj",
    storageBucket: "thinksmith-first-prin-jyj.firebasestorage.app",
    messagingSenderId: "40763893317",
    appId: "1:40763893317:web:e5acad6d31c59c8bc4e52c"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
