document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");

    if (!form) {
        console.error("Form with id='contact-form' not found!");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // Get values by ID
        const first_name = document.getElementById("first_name").value.trim();
        const last_name  = document.getElementById("last_name").value.trim();
        const email      = document.getElementById("email").value.trim();
        const subject    = document.getElementById("subject").value.trim();
        const message    = document.getElementById("message").value.trim();

        // Basic frontend validation
        if (!first_name || !last_name || !email || !subject || !message) {
            showToast("⚠️ Please fill in all fields.", "#f59e0b");
            return;
        }

        // Show sending state
        submitBtn.innerHTML = "Sending...";
        submitBtn.disabled = true;

        try {
            const response = await fetch("/.netlify/functions/sendEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ first_name, last_name, email, subject, message }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showToast("✅ Message sent successfully!", "#10b981");
                form.reset();
            } else {
                showToast(`❌ ${result.error || "Failed to send message. Please try again."}`, "#ef4444");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            showToast("❌ Network error. Please check your connection.", "#ef4444");
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});

// ====================== TOAST HELPER ======================
function showToast(text, backgroundColor) {
    Toastify({
        text,
        duration: 4500,
        gravity: "top",
        position: "right",
        backgroundColor,
        stopOnFocus: true,
        close: true,
    }).showToast();
}