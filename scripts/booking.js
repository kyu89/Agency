import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCuAtP-ak_HFMP29d3iNTl9QzmhNyTf3k",
  authDomain: "agency-project-774a0.firebaseapp.com",
  projectId: "agency-project-774a0",
  storageBucket: "agency-project-774a0.firebasestorage.app",
  messagingSenderId: "840588106289",
  appId: "1:840588106289:web:7fb86917f39934d3219310"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("bookingForm");

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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;

  if (document.getElementById("website").value !== "") return;

  const fullName = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const company = document.getElementById("company").value.trim();
  const serviceType = document.getElementById("service").value;
  const description = document.getElementById("details").value.trim();
  const budgetMinValue = document.getElementById("budgetMin").value;
  const budgetMaxValue = document.getElementById("budgetMax").value;
  const deadlineValue = document.getElementById("deadline").value;

  if (!fullName || !email || !serviceType || !description || !budgetMinValue || !budgetMaxValue || !deadlineValue)  {
    showToast("Please fill in all required fields.", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  const budgetMin = parseInt(budgetMinValue);
  const budgetMax = parseInt(budgetMaxValue);

  if (isNaN(budgetMin) || isNaN(budgetMax)) {
    showToast("Please enter valid budget amounts.", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  if (budgetMin > budgetMax) {
    showToast("Minimum budget cannot be greater than maximum budget.", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  const deadline = deadlineValue ? new Date(deadlineValue) : null;

   if (document.getElementById("website").value !== "") return;

  // ✅ CAPTCHA
  const captcha = grecaptcha.getResponse();
  if (!captcha) {
    showToast("Please verify you are not a robot.", "#dc2626");
    return;
  }

  btn.innerHTML = "Submitting...";
  btn.disabled = true;

  const data = {
    fullName,
    email,
    company,
    serviceType,
    priority: 'normal',
    description,
    budgetMin,
    budgetMax,
    deadline,
    status: "pending",
    archived: false,
    assignedTo: null,
    createdAt: serverTimestamp(),
    notes: ""
  };

try {
  await addDoc(collection(db, "bookings"), data, captcha);
  
  gtag('event', 'booking_submitted', {
        event_category: 'Booking',
        event_label: 'User Booking Form'
    });

  form.reset();
  grecaptcha.reset();

  setTimeout(() => {
    currentStep = 0;
    showStep(currentStep);
  }, 0);

  showToast("Request submitted successfully!", "linear-gradient(135deg, #22c55e, #117737)");

} catch (error) {
  console.error(error);

  showToast("Failed to submit. Try again.", "linear-gradient(135deg, #881515, #dc2626)");
}

  btn.innerHTML = originalText;
  btn.disabled = false;
});

const steps = document.querySelectorAll(".form-step");
const indicators = document.querySelectorAll(".step");

let currentStep = 0;

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
    indicators[i].classList.toggle("active", i === index);
  });
}

document.getElementById("next1").onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
   const companyName = document.getElementById("company").value.trim();

  if (!name || !email || !companyName) {
    showToast("Fill required fields", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  currentStep = 1;
  showStep(currentStep);
};

document.getElementById("next2").onclick = (e) => {
  e.preventDefault();
  e.stopPropagation(); 

  const service = document.getElementById("service").value.trim();
  const details = document.getElementById("details").value.trim();

  if (!service || !details) {
    showToast("Fill required fields", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  currentStep = 2;
  showStep(currentStep);
};

document.getElementById("back1").onclick = () => {
  currentStep = 0;
  showStep(currentStep);
};

document.getElementById("back2").onclick = () => {
  currentStep = 1;
  showStep(currentStep);
};

document.addEventListener("DOMContentLoaded", () => {
  currentStep = 0;
  showStep(currentStep);
});

