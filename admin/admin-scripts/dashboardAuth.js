import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
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

/* 🔐 PROTECTION - Check if user is logged in and authorized */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/admin";
    showToast("Please log in to access the dashboard.", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  /* ✅ ALLOW ONLY AUTHORIZED USERS */
  const allowedEmails = [
    "sulitjohnkevin@gmail.com",
    "sulitkevin85@gmail.com",
    "admin@digitaldonglers.com"
  ];

  if (!allowedEmails.includes(user.email)) {
    showToast("Not authorized", "linear-gradient(135deg, #ef4444, #dc2626)");
    window.location.href = "/";
  }
});

/* =========================
   LOGOUT FUNCTION
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "/admin/login.html";
      });
    });
  }
});

export { auth };