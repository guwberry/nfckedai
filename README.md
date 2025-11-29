Testing auth locally
--------------------
If you're seeing pages accessible while you think you're not logged in, try the following to confirm authentication behavior:

- Open an incognito/private window; this ensures no existing sessions are present.
- Open `login.html` and sign in as the admin to test flows.
- To test unauthorized access, clear session storage and cookies in your browser, then visit `index.html` — it should redirect to `login.html`.

To clear session storage in the browser console:

```javascript
sessionStorage.clear();
localStorage.removeItem('nfcAuthUser');
```

NFC Repair Log — Quick Start: Authentication
===========================================

This repo has a simple auth implementation that supports two modes:

- Recommended (production-like): Create a Firebase Auth Email/Password user in the Firebase Console. Use that admin user to sign in. The app uses the Firebase compat SDK on the client and guards all admin pages.
- Developer fallback (insecure / for local dev): The app includes a hard-coded credential fallback (email: `admin@nfcked.local`, password: `repair123`) that works when Firebase SDK is not present. This is deliberately insecure — do not use for production.

Configured protected pages
-------------------------
All pages except `customer-scan.html` require login and will automatically redirect to `login.html` if the user is not signed in.

How to create the admin user (recommended)
-----------------------------------------
1. Open the Firebase Console for your project.
2. Go to Authentication → Users → Add user.
3. Enter the admin's Email and Password.

After creating the user, sign in with the credentials on `login.html`. The app will authenticate using Firebase Auth.

Local dev fallback
------------------
If the Firebase SDK is not available (or you want an immediate local dev mode), use the credentials:

	Email: admin@nfcked.local
	Password: repair123

Files updated
-------------
- `src/js/auth.js` - Auth wrapper that supports Firebase Auth or local fallback
- `login.html` - Uses `NFCAUTH.signIn` and redirects on success
- `index.html`, `register-card.html`, `orders-overview.html`, `canvas.html`, `support-tools.html` - include `NFCAUTH` and require sign-in

Next steps (if you want to harden it)
------------------------------------
1. Use Firebase's modular SDK instead of compat if you're building a production SPA. The wrapper is simple to migrate.
2. Use Firestore security rules requiring `request.auth != null` to prevent unauthorized access server-side.
3. Create a `users` collection and use roles or custom claims for role-based access restrictions.
4. Remove the local fallback and avoid hard-coding anything in client-side code for production.

If you'd like, I can now implement either:
- Firestore security rules + `users` collection setup
- Add Cloud Function to automatically write `users` documents and set custom claims
- Migrate to the Firebase modular SDK

Local development and Emulator
-----------------------------
1. Install Firebase CLI:

```powershell
npm install -g firebase-tools
firebase login
```

2. Initialize emulators (if not already):

```powershell
firebase init emulators
```

3. Start the Emulator Suite:

```powershell
firebase emulators:start
```

4. Use the emulator `Authentication` UI to create your admin user for testing or create it via the Console (if you're testing against production project, skip emulators).

Deploying rules and functions
-----------------------------
To deploy Firestore rules and Functions once ready:

```powershell
firebase deploy --only firestore:rules,functions
```

To deploy Hosting:

```powershell
firebase deploy --only hosting
```

