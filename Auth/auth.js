import { auth, db } from "../firebase lesson/config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

export async function signUp(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // Save profile info under users/{uid}
    await setDoc(doc(db, "users", uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString()
    });

    return uid;
}


export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const user = userCredential.user;

    return user;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);

    console.log("Password reset email sent successfully!");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export async function getUser() {

  return new Promise((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
            unsub();
            resolve(user ? user.uid : null);
        });
    });
}

// ─── NEW: get the full user profile (name, email) from Firestore ─────
export async function getUserProfile() {
    const uid = await getUser();
    if (!uid) return null;

    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
        return { uid, name: null, email: null };
    }
    return { uid, ...snap.data() };
}
