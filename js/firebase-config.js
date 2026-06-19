// ─── Firebase App + Services (SDK v12.14.0 Modular CDN) ────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

// ── Nest&Key Firebase Project Config ────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBqPhevg_YcFc_hU1_ipIMjGkP-cobR_j0",
  authDomain:        "nestandkey-9b286.firebaseapp.com",
  databaseURL:       "https://nestandkey-9b286-default-rtdb.firebaseio.com",
  projectId:         "nestandkey-9b286",
  storageBucket:     "nestandkey-9b286.firebasestorage.app",
  messagingSenderId: "1062505743356",
  appId:             "1:1062505743356:web:93f5d63a4d6293bd4a2879",
  measurementId:     "G-7TN79KTRBN",
};

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
