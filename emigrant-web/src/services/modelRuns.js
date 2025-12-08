import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';

const runsCol = collection(db, 'forecasting_model_runs');

/**
 * Save a training run
 * kind: 'LSTM' | 'MLP'
 * payload: { lookback, units, dropout, mae, accuracy, rmse, r2, mape, dataset, trainedAt, activation? }
 */
export async function saveModelRun(kind, payload) {
  const docRef = await addDoc(runsCol, { kind, ...payload });
  return docRef.id;
}

/** Get best run by accuracy for an optional dataset, filtered client-side (no composite index needed) */
export async function getBestRun(kind, dataset) {
  const q = query(runsCol, orderBy('accuracy', 'desc'), limit(200));
  const snap = await getDocs(q);
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return rows.find(r => r.kind === kind && (!dataset || r.dataset === dataset)) || null;
}

/** Get best overall run across kinds for an optional dataset */
export async function getBestOverallRun(dataset) {
  const kinds = ['LSTM', 'MLP'];
  const results = await Promise.all(kinds.map(k => getBestRun(k, dataset)));
  const filtered = results.filter(Boolean);
  if (filtered.length === 0) return null;
  return filtered.sort((a, b) => (Number(b.accuracy) || 0) - (Number(a.accuracy) || 0))[0];
}

/** Get all runs ordered by trainedAt desc, filtered client-side by dataset */
export async function getAllRuns(dataset) {
  const q = query(runsCol, orderBy('trainedAt', 'desc'));
  const snap = await getDocs(q);
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return dataset ? rows.filter(r => r.dataset === dataset) : rows;
}

/** Delete a run by id */
export async function deleteModelRun(id) {
  await deleteDoc(doc(db, 'forecasting_model_runs', id));
}