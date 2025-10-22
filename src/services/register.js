import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc } from 'firebase/firestore';

const usersCollection = collection(db, "users");

export const registerUser = async (data) => {
  // Register with Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

  // Optionally set display name
  await updateProfile(userCredential.user, {
    displayName: data.username
  });

  // Save extra info (no password!) in Firestore
  await addDoc(usersCollection, {
    uid: userCredential.user.uid,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    username: data.username,
    role: data.role
  });
};