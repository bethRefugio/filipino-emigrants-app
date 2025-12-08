// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBheNqcHE1mIn5jcGROFSvT_kbVFFnwwDw",
  authDomain: "filipinoemigrantsdb-9cc1e.firebaseapp.com",
  projectId: "filipinoemigrantsdb-9cc1e",
  storageBucket: "filipinoemigrantsdb-9cc1e.firebasestorage.app",
  messagingSenderId: "606898930387",
  appId: "1:606898930387:web:b12e70de92a9ca11ed8a26"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const database = getDatabase(app);



