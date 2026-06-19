# Nest&Key — Setup Guide

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Enable the following services:
   - **Authentication** → Sign-in methods → **Email/Password** → Enable
   - **Cloud Firestore** → Create database → Start in **production mode**
   - **Storage** → Get started → Start in **production mode**

---

## 2. Configure Firebase Credentials

Open **`js/firebase-config.js`** and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",          // ← replace
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

**Where to find this:**  
Firebase Console → ⚙️ Project Settings → Your apps → SDK setup and configuration

---

## 3. Create the Admin User

Firebase does not auto-create admin accounts. Do this manually:

Firebase Console → **Authentication** → **Users** tab → **Add user**

- Enter your admin email and a strong password.
- Use these credentials on the `/admin-login.html` page.

---

## 4. Firestore Security Rules

In Firebase Console → Firestore → **Rules**, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Anyone can read properties (public landing page)
    match /properties/{doc} {
      allow read: if true;
      // Only authenticated users (admin) can write
      allow write: if request.auth != null;
    }
  }
}
```

---

## 5. Firebase Storage Rules

In Firebase Console → Storage → **Rules**, paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{allPaths=**} {
      allow read:  if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 6. Running the Project

Because the code uses ES Modules (`type="module"`), it **must be served over HTTP** — not opened as a `file://` URL directly.

**Option A — XAMPP (your setup):**
Place the `nestkey/` folder inside `c:\xampp\htdocs\Personal\` and visit:
```
http://localhost/Personal/nestkey/
```

**Option B — VS Code Live Server:**
Right-click `index.html` → Open with Live Server

---

## 7. File Structure

```
nestkey/
├── index.html              # Public landing page
├── admin-login.html        # Admin login
├── admin-dashboard.html    # Protected admin CRUD panel
├── css/
│   ├── styles.css          # Landing page styles
│   └── admin.css           # Admin panel styles
└── js/
    ├── firebase-config.js  # Firebase init (⚠️ edit this!)
    ├── auth.js             # Login / logout / route guard
    ├── properties.js       # Firestore CRUD
    ├── storage.js          # Image upload/delete
    └── landing.js          # Landing page logic & filters
```

---

## 8. Firestore Index (if needed)

If you see a Firestore index error in the console, click the auto-generated link in the error message to create the composite index for `createdAt DESC`.

---

## 9. Deployment (Optional)

To deploy for free, install the Firebase CLI and run:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # choose nestkey/ as public dir, SPA: No
firebase deploy
```

---

Made with ♥ in Tiruppur by [MuraliTharan_R](https://muralitharan-portfolio.netlify.app/)
