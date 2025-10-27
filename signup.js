import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("✅ signup.js is running");

const fullNameInput = document.getElementById("fullName");
const universityInput = document.getElementById("university");
const majorInput = document.getElementById("major");
const standingInput = document.getElementById("standing");
const totalCreditsInput = document.getElementById("totalCredits");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const signupBtn = document.getElementById("signupBtn");
const messageEl = document.getElementById("message");

signupBtn.addEventListener("click", async () => {
  const fullName = fullNameInput.value.trim();
  const university = universityInput.value.trim();
  const major = majorInput.value.trim();
  const standing = standingInput.value.trim();
  const totalCredits = parseInt(totalCreditsInput.value.trim());
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Check all fields are filled
  if (!fullName || !university || !major || !standing || !email || !password || !confirmPassword || isNaN(totalCredits)) {
    messageEl.style.color = "red";
    messageEl.textContent = "All fields are required.";
    return;
  }

  // Check totalCredits is valid
  if (totalCredits < 0) {
    messageEl.style.color = "red";
    messageEl.textContent = "Total credits must be a non-negative number.";
    return;
  }

  // Confirm password match
  if (password !== confirmPassword) {
    messageEl.style.color = "red";
    messageEl.textContent = "Passwords do not match.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      fullName,
      university,
      major,
      standing,
      totalCredits,
      email
    });

    messageEl.style.color = "green";
    messageEl.textContent = "Account created successfully!";
    window.location.href = "index.html";
  } catch (error) {
    messageEl.style.color = "red";
    messageEl.textContent = error.message;
    console.error("❌ Signup failed:", error);
  }
});
    