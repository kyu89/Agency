import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCuAtP-ak_HFMP29d3iNTl9QzmhNyTf3k",
  authDomain: "agency-project-774a0.firebaseapp.com",
  projectId: "agency-project-774a0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const ADMIN_VERIFY_ENDPOINT = "/.netlify/functions/verifyAdmin";

function showToast(text, background) {
  Toastify({
    text,
    duration: 4500,
    gravity: "top",
    position: "right",
    backgroundColor: background,
    stopOnFocus: true,
    close: true,
    style: {
      borderRadius: "12px",
      padding: "14px 18px",
      fontSize: "14px",
      fontFamily: "Poppins",
      fontWeight: "500",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.27)",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255, 255, 255, 0.06)"
    },
    className: "toastify-premium"
  }).showToast();
}

async function verifyAdminUser() {
  const idToken = await auth.currentUser?.getIdToken(true);
  if (!idToken) {
    throw new Error("No authenticated user token");
  }

  const response = await fetch(ADMIN_VERIFY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    }
  });

  const payload = await response.json();
  if (!response.ok || !payload.authorized) {
    throw new Error(payload.error || "User is not authorized");
  }

  return payload;
}

// Enable persistence for session
setPersistence(auth, browserLocalPersistence);

/* =========================
   EMAIL LOGIN
========================= */
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showToast("Please enter both email and password.", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  const captcha = grecaptcha.getResponse();
  if (!captcha) {
    showToast("Please verify you are not a robot.", "#dc2626");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    await verifyAdminUser();
    window.location.href = "/dashboard";
  } catch (error) {
    showToast(error.message.includes("authorized") ? "This account is not authorized." : "Invalid email or password.", "linear-gradient(135deg, #ef4444, #dc2626)");
    await signOut(auth);
    grecaptcha.reset();
  }
});

/* =========================
   GOOGLE LOGIN
========================= */
const provider = new GoogleAuthProvider();

document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    await verifyAdminUser();
    window.location.href = "/dashboard";
    showToast("Logged in with Google!", "linear-gradient(135deg, #34d399, #10b981)");
  } catch (error) {
    showToast(error.message.includes("authorized") ? "This Google account is not authorized." : "Google login failed.", "linear-gradient(135deg, #ef4444, #dc2626)");
    await signOut(auth);
  }
});