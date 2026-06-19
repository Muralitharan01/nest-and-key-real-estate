// ─── Auth Helpers ──────────────────────────────────────────────────────────
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

// Sign the admin in; resolves with user or rejects with Firebase error.
export async function adminLogin(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// Sign out and send back to the landing page (not the login page —
// avoids an unnecessary redirect chain).
export async function adminLogout() {
  await signOut(auth);
  window.location.href = "index.html";
}

// ── Route Guard ────────────────────────────────────────────────────────────
// Use on PROTECTED pages (admin-dashboard.html only).
// Unauthenticated visitors are redirected to the public home page
// so customers who stumble on the URL see the site, not a login page.
export function guardAdmin(onAuthorized) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html"; // ← send customers home, not to login
    } else {
      onAuthorized(user);
    }
  });
}

// ── Login Page Helper ──────────────────────────────────────────────────────
// Use ONLY on admin-login.html.
// If the admin is already logged in → jump straight to dashboard.
// If NOT logged in → do nothing (let the form render).
// This replaces calling guardAdmin() on the login page, which caused the
// infinite redirect loop (guardAdmin → not authed → redirect to login → loop).
export function redirectIfLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "admin-dashboard.html";
    }
    // Not logged in → stay on login page, no action needed.
  });
}
