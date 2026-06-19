// ─── Firestore — Enquiries CRUD ──────────────────────────────────────────────
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const COLLECTION = "enquiries";
const enqCol    = () => collection(db, COLLECTION);

// ── CREATE ─────────────────────────────────────────────────────────────────
export async function addEnquiry(data) {
  return addDoc(enqCol(), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// ── READ (real-time listener) ──────────────────────────────────────────────
export function listenToEnquiries(onChange) {
  const q = query(enqCol(), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange(list);
  });
}

// ── UPDATE ─────────────────────────────────────────────────────────────────
export async function updateEnquiryStatus(id, status) {
  return updateDoc(doc(db, COLLECTION, id), { status });
}
