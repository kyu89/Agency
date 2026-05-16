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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Hide dashboard contents while verifying admin authorization.
if (typeof document !== "undefined" && document.body) {
  document.body.classList.add("admin-auth-loading");
}

// Enable persistence for session
setPersistence(auth, browserLocalPersistence);

async function verifyAdminUser(idToken) {
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

/* 🔐 PROTECTION - Check if user is logged in and authorized */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/admin";
    return;
  }

  try {
    const idToken = await user.getIdToken(true);
    await verifyAdminUser(idToken);

    if (typeof document !== "undefined" && document.body) {
      document.body.classList.remove("admin-auth-loading");
      document.body.classList.add("admin-authenticated");
    }
  } catch (error) {
    console.error("Admin verification failed:", error);
    showToast("Not authorized", "linear-gradient(135deg, #ef4444, #dc2626)");
    await signOut(auth);
    window.location.href = "/admin";
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