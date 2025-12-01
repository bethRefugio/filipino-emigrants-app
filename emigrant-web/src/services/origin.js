import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const originCollection = collection(db, "origin");

// CREATE
export const addEmigrant = async (data) => {
  await addDoc(originCollection, data);
};

// READ
export const getEmigrants = async () => {
  const snapshot = await getDocs(originCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// UPDATE
export const updateEmigrant = async (id, data) => {
  const docRef = doc(db, "origin", id);
  await updateDoc(docRef, data);
};

// DELETE
export const deleteEmigrant = async (id) => {
  const docRef = doc(db, "origin", id);
  await deleteDoc(docRef);
};