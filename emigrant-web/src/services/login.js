import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from 'firebase/firestore';

const usersCollection = collection(db, "users");

export const loginUser = async (email, password) => {
  // Login with Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Get extra info from Firestore
  const q = query(usersCollection, where("uid", "==", userCredential.user.uid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error("User profile not found.");

  const user = snapshot.docs[0].data();
  return { ...user, id: snapshot.docs[0].id };
};