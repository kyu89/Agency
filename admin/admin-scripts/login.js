import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCuAtP-ak_HFMP29d3iNTl9QzmhNyTf3k",
  authDomain: "agency-project-774a0.firebaseapp.com",
  projectId: "agency-project-774a0"
};

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
    await signInWithEmailAndPassword(auth, email, password, captcha);
    window.location.href = "/dashboard";
  } catch (error) {
    showToast("Invalid email or password.", "linear-gradient(135deg, #ef4444, #dc2626)");
     grecaptcha.reset();
  }
});

/* =========================
   GOOGLE LOGIN
========================= */
const provider = new GoogleAuthProvider();
// Add authorized Google email(s) here
const AUTHORIZED_EMAILS = ["sulitjohnkevin@gmail.com", "sulitkevin85@gmail.com", "admin@digitaldonglers.com"];

document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const userEmail = result.user.email;

    // Check if the email is authorized
    if (!AUTHORIZED_EMAILS.includes(userEmail)) {
      // Sign out the user if not authorized
      await auth.signOut();
      showToast("This Google account is not authorized.", "linear-gradient(135deg, #ef4444, #dc2626)");
      return;
    }

    window.location.href = "/dashboard";
    showToast("Logged in with Google!", "linear-gradient(135deg, #34d399, #10b981)");
  } catch (error) {
    showToast("Google login failed.", "linear-gradient(135deg, #ef4444, #dc2626)");
  }
});