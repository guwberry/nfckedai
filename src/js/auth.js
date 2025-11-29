/*
  Simple Auth wrapper (compat SDK) for NFC Repair app.
  - Initializes Firebase if config provided
  - Exposes signIn/signOut/onAuthStateChanged/requireAuth
  - Includes a small local fallback for dev that uses hard-coded credentials
  NOTE: Recommended production flow: create the admin user in Firebase Console and use firebase.auth().
*/
(function(global){
  const NFCAUTH = {};
  let _inited = false;
  const LOCAL_DEV_ACCOUNT = { email: 'admin@nfcked.local', password: 'repair123' };

  NFCAUTH.init = function(firebaseConfig) {
    try {
      if(!window.firebase) {
        console.warn('Firebase SDK not found. Local fallback is available for dev testing.');
        _inited = true; // allow local fallback
        return;
      }
      if(!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      _inited = true;
    } catch (e) {
      console.warn('init firebase failed', e);
      _inited = true; // ok for dev fallback
    }
  };

  NFCAUTH.signIn = async function(email, password) {
    if(window.firebase && firebase.auth) {
      return firebase.auth().signInWithEmailAndPassword(email, password);
    }
    // local fallback (insecure for production): check hard-coded account
    if(email === LOCAL_DEV_ACCOUNT.email && password === LOCAL_DEV_ACCOUNT.password) {
      sessionStorage.setItem('nfcAuthUser', email);
      return { user: { email } };
    }
    throw new Error('Invalid credentials (local dev fallback)');
  };

  NFCAUTH.signOut = async function() {
    if(window.firebase && firebase.auth) {
      return firebase.auth().signOut();
    }
    sessionStorage.removeItem('nfcAuthUser');
  };

  NFCAUTH.getCurrentUser = function() {
    if(window.firebase && firebase.auth) return firebase.auth().currentUser;
    const email = sessionStorage.getItem('nfcAuthUser');
    return email ? { email } : null;
  };

  NFCAUTH.onAuthStateChanged = function(cb) {
    if(window.firebase && firebase.auth) {
      firebase.auth().onAuthStateChanged(cb);
      return;
    }
    // Local fallback: fire once with sessionStorage value
    setTimeout(() => cb(NFCAUTH.getCurrentUser()), 0);
  };

  // Guard: call on protected pages
  NFCAUTH.requireAuth = function(redirectTo) {
    // Hide page content while auth is being checked to avoid flicker/access
    try {
      document.documentElement.style.visibility = 'hidden';
    } catch (e) {/* ignore */}

    let resolved = false;
    const finish = (user) => {
      if(resolved) return;
      resolved = true;
      if(!user) {
        // Not logged in: replace location (avoid adding to history)
        window.location.replace(redirectTo || 'login.html');
      } else {
        try { document.documentElement.style.visibility = ''; } catch (e) { /* ignore */ }
      }
    };

    // Check synchronous fallback first
    const immediate = NFCAUTH.getCurrentUser();
    if(immediate) {
      finish(immediate);
      return;
    }

    // Otherwise wait for auth state change
    NFCAUTH.onAuthStateChanged((user) => {
      finish(user);
    });
  };

  // Optional UI helpers: wire sign-in/out buttons automatically if present
  NFCAUTH.autoWireUi = function() {
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    if(btnLogin) {
      btnLogin.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('username') || {}).value;
        const password = (document.getElementById('password') || {}).value;
        try {
          await NFCAUTH.signIn(email, password);
          window.location = 'index.html';
        } catch(err) {
          const errEl = document.getElementById('login-error');
          if(errEl) {
            errEl.classList.remove('hidden');
            errEl.textContent = err.message || 'Login failed';
          }
        }
      });
    }
    if(btnLogout) {
      btnLogout.addEventListener('click', async () => { await NFCAUTH.signOut(); window.location = 'login.html'; });
    }
  };

  global.NFCAUTH = NFCAUTH;
})(window);
