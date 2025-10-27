import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpj65acevnA-AarpotYiUKx60arO4yQq4",
  authDomain: "coursetracker-9d55c.firebaseapp.com",
  projectId: "coursetracker-9d55c",
  storageBucket: "coursetracker-9d55c.firebasestorage.app",
  messagingSenderId: "413789868805",
  appId: "1:413789868805:web:be34f472621c3e00a45d6c",
  measurementId: "G-49MBKDMFXB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // ✅ Add this line

export { db, auth }; // ✅ Export both
