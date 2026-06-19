// ─── Firestore — Property CRUD ─────────────────────────────────────────────
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const COLLECTION = "properties";
const propCol    = () => collection(db, COLLECTION);

// ── CREATE ─────────────────────────────────────────────────────────────────
export async function addProperty(data) {
  return addDoc(propCol(), { ...data, createdAt: serverTimestamp() });
}

// ── READ (one-time) ────────────────────────────────────────────────────────
export async function fetchProperties() {
  const snap = await getDocs(query(propCol(), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── READ (real-time listener) ──────────────────────────────────────────────
// Calls onChange(properties[]) every time Firestore data changes.
export function listenToProperties(onChange) {
  const q = query(propCol(), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange(list);
  });
}

// ── UPDATE ─────────────────────────────────────────────────────────────────
export async function updateProperty(id, data) {
  return updateDoc(doc(db, COLLECTION, id), data);
}

// ── DELETE ─────────────────────────────────────────────────────────────────
export async function deleteProperty(id) {
  return deleteDoc(doc(db, COLLECTION, id));
}
