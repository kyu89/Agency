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

        const first_name = document.getElementById("first_name").value.trim();
        const last_name  = document.getElementById("last_name").value.trim();
        const email      = document.getElementById("email").value.trim();
        const subject    = document.getElementById("subject").value.trim();
        const message    = document.getElementById("message").value.trim();

        if (!first_name || !last_name || !email || !subject || !message) {
            showToast("⚠️ Please fill in all fields.", "linear-gradient(135deg, #f59e0b, #f97316)");
            return;
        }

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
                showToast("Message sent successfully!", "linear-gradient(135deg, #22c55e, #117737)");
                form.reset();
            } else {
                showToast(`${result.error || "Failed to send message. Please try again."}`, "linear-gradient(135deg, #881515, #dc2626)");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            showToast("Network error. Please check your connection.", "linear-gradient(135deg, #881515, #dc2626)");
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});

function showToast(text, backgroundColor) {
    Toastify({
        text,
        duration: 4500,
        gravity: "top",
        position: "right",
        backgroundColor,
        stopOnFocus: true,
        close: true,
        style: {
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "14px",
            FontFamily: "Poppins",
            fontWeight: "500",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.27)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.06)"
        },
        offset: {
            x: 10,
            y: 10
        },
        className: "toastify-premium"
    }).showToast();
}