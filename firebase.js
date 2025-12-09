// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTccvzs87BV1DTv4w7bdE_FY7LcLs0SXQ",
    authDomain: "lession-8d125.firebaseapp.com",
    projectId: "lession-8d125",
    storageBucket: "lession-8d125.firebasestorage.app",
    messagingSenderId: "281858885118",
    appId: "1:281858885118:web:db93e6a63e5ed7c13e6caf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };