
 // Import the Firebase Authentication and Firestore database from your configuration file.
import { auth, db } from "../firebase lesson/config.js";

// Import functions needed to create accounts, sign in, reset passwords,
// get the current authentication instance, and monitor authentication changes.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// Import functions used to access Firestore documents, save data,
// retrieve documents, and generate server timestamps.
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Create an asynchronous function that registers a new user.
// The function receives the user's name, email, and password.
export async function signUp(name, email, password) {

  // Create a new Firebase Authentication account using the email and password.
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Get the unique user ID assigned to the newly registered user.
  const uid = cred.user.uid;

  // Save the user's profile information in the Firestore users collection.
  // The document ID is the same as the user's unique Firebase ID.
  await setDoc(doc(db, "users", uid), {

    // Store the user's name in the profile document.
    name: name,

    // Store the user's email address in the profile document.
    email: email,

    // Store the account creation date and time as a string.
    createdAt: new Date().toISOString()
  });

  // Return the user's unique ID after the profile has been saved.
  return uid;
}


// Create an asynchronous function that signs in an existing user.
// The function receives the user's email and password.
export async function signIn(email, password) {
  try {

    // Check the email and password against Firebase Authentication.
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Get the authenticated user's information from the result.
    const user = userCredential.user;

    // Return the authenticated user's information to the calling code.
    return user;

  } catch (error) {

    // Display the error message in the browser console if sign-in fails.
    console.log(error.message);

    // Pass the error to the calling code so it can handle the failure.
    throw error;
  }
}


// Create an asynchronous function to send a password reset email.
// The function receives the email address of the account.
export async function resetPassword(email) {
  try {

    // Ask Firebase Authentication to send a password reset email.
    await sendPasswordResetEmail(auth, email);

    // Display a success message in the browser console.
    console.log("Password reset email sent successfully!");

  } catch (error) {

    // Display the error message if the password reset request fails.
    console.log(error.message);

    // Pass the error to the calling code so it can handle the failure.
    throw error;
  }
}


// Create an asynchronous function to get the currently signed-in user's ID.
export async function getUser() {

  // Return a Promise that waits for Firebase to check the authentication state.
  return new Promise((resolve) => {

    // Listen for changes to the user's authentication state.
    const unsub = onAuthStateChanged(auth, (user) => {

      // Stop listening after the first authentication result is received.
      unsub();

      // Return the user's unique ID if signed in, or null if no user is signed in.
      resolve(user ? user.uid : null);
    });
  });
}


// ─── Get the full user profile (name and email) from Firestore ─────

// Create an asynchronous function that retrieves the current user's profile.
export async function getUserProfile() {

  // Call getUser() to obtain the current user's unique ID.
  const uid = await getUser();

  // If no user is signed in, return null because there is no profile to retrieve.
  if (!uid) return null;

  // Find the user's profile document in the Firestore users collection
  // and retrieve its contents.
  const snap = await getDoc(doc(db, "users", uid));

  // Check whether the user's profile document exists in Firestore.
  if (!snap.exists()) {

    // If the document does not exist, return the ID with empty profile values.
    return { uid, name: null, email: null };
  }

  // Return the user's ID together with all the information saved in the document.
  return { uid, ...snap.data() };
}
