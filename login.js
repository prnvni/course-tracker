import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

console.log("✅ login.js is running");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageEl = document.getElementById("message");
const loginBtn = document.getElementById("loginBtn");
const forgotPasswordLink = document.getElementById("forgotPassword");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login success:", userCredential.user);
    messageEl.style.color = "green";
    messageEl.textContent = "Login successful!";
    window.location.href = "index.html"; // or redirect to dashboard page
  } catch (error) {
    messageEl.style.color = "red";
    messageEl.textContent = error.message;
    console.error("❌ Login failed:", error);
  }
});

forgotPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();

  if (!email) {
    messageEl.style.color = "red";
    messageEl.textContent = "Enter your email first to reset password.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    messageEl.style.color = "green";
    messageEl.textContent = "Password reset email sent.";
  } catch (error) {
    messageEl.style.color = "red";
    messageEl.textContent = error.message;
    console.error("❌ Password reset error:", error);
  }
});
