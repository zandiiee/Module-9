
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';

import { getAuth } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';

import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBtMyxQuxUGHvyILcNCXTLrHDHDS9RNfA4",
    authDomain: "library-management-syste-72721.firebaseapp.com",
    projectId: "library-management-syste-72721",
    storageBucket: "library-management-syste-72721.firebasestorage.app",
    messagingSenderId: "719521677642",
    appId: "1:719521677642:web:eef91e55e1ea4c889741b3",
    measurementId: "G-X6YDQZPWFZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
