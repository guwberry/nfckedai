const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  const role = 'tech'; // default role for new users
  const docRef = admin.firestore().collection('users').doc(user.uid);
  await docRef.set({ email: user.email || null, role, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  // Optional: set a custom claim for quick role checks
  await admin.auth().setCustomUserClaims(user.uid, { role });
  return null;
});
