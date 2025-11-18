// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBT_ilkjNnf-JSZrt-PYjlPRLmNnE7IpvQ",
    authDomain: "lessions-26a88.firebaseapp.com",
    projectId: "lessions-26a88",
    storageBucket: "lessions-26a88.firebasestorage.app",
    messagingSenderId: "1008577117048",
    appId: "1:1008577117048:web:4b3bb1b32cfeee4696a68d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };