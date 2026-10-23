
/* ==================================
   MOBILE NAVIGATION
================================== */

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            const isExpanded =
                menuToggle.getAttribute("aria-expanded") === "true";

            menuToggle.setAttribute(
                "aria-expanded",
                String(!isExpanded)
            );

            nav.classList.toggle("open", !isExpanded);
            menuToggle.textContent = isExpanded ? "☰" : "×";
        });
    }


    /* ==================================
       GALLERY LIGHTBOX
    ================================== */

    const lightbox = document.querySelector(".lightbox");

    if (lightbox) {
        const largeImage = lightbox.querySelector("img");
        const closeButton = lightbox.querySelector(".lightbox-close");

        const closeLightbox = () => {
            lightbox.classList.remove("open");
            lightbox.setAttribute("aria-hidden", "true");
            largeImage.src = "";
        };

        document.querySelectorAll(".photo-tile").forEach((tile) => {
            tile.addEventListener("click", () => {
                const thumbnail = tile.querySelector("img");

                largeImage.src = tile.dataset.full;
                largeImage.alt = thumbnail
                    ? thumbnail.alt
                    : "Wedding photo";

                lightbox.classList.add("open");
                lightbox.setAttribute("aria-hidden", "false");
            });
        });

        if (closeButton) {
            closeButton.addEventListener("click", closeLightbox);
        }

        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeLightbox();
            }
        });
    }
});


/* ==================================
   RSVP FORM SUBMISSION
================================== */

const rsvpForm = document.getElementById("rsvp-form");
const formMessage = document.getElementById("form-message");
const saveButton = rsvpForm?.querySelector('[type="submit"]');

if (rsvpForm && formMessage && saveButton) {
    rsvpForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!rsvpForm.reportValidity()) {
            return;
        }

        const formData = new FormData(rsvpForm);

        const rsvp = {
            name: String(formData.get("name") || "").trim(),
            guest_name: String(formData.get("guestName") || "").trim(),
            phone: String(formData.get("phone") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            attending: formData.get("attending"),
            agreement: formData.get("agreement") === "on"
        };

        if (!rsvp.agreement) {
            formMessage.textContent =
                "Please accept the Rule Agreement before submitting.";
            return;
        }

        if (!["yes", "no"].includes(rsvp.attending)) {
            formMessage.textContent =
                "Please select whether you will be attending.";
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "SAVING...";
        formMessage.textContent = "Submitting your RSVP...";

        try {
            const { error } = await supabaseClient
                .from("rsvps")
                .insert([rsvp]);

            if (error) {
                throw error;
            }

            formMessage.textContent =
                "Thank you! Your RSVP has been received.";

            rsvpForm.reset();

        } catch (error) {
            console.error("RSVP submission failed:", error);

            formMessage.textContent =
                "We couldn't save your RSVP. Please try again. " +
                "If the problem continues, contact the couple.";

        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "SAVE RSVP";
        }
    });
}


/* ==================================
   SCROLL-LINKED HERO ANIMATION
================================== */

(() => {
    const stage = document.getElementById("hero-stage");
    const frame = document.getElementById("wedding-hero-frame");
    const topHeading = document.getElementById("hero-heading-top");
    const bottomHeading = document.getElementById("hero-heading-bottom");
    const hint = document.getElementById("scroll-hint");

    if (!stage || !frame || !topHeading || !bottomHeading || !hint) {
        return;
    }

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let scheduled = false;

    function updateHero() {
        scheduled = false;

        const rect = stage.getBoundingClientRect();
        const travel = Math.max(
            1,
            stage.offsetHeight - window.innerHeight
        );

        const progress = Math.min(
            1,
            Math.max(0, -rect.top / travel)
        );

        const eased = progress * progress * (3 - 2 * progress);

        const startWidth = Math.min(window.innerWidth * 0.84, 940);
        const startHeight = Math.min(
            window.innerWidth * 0.47,
            window.innerHeight * 0.58
        );

        const width =
            startWidth + (window.innerWidth - startWidth) * eased;

        const height =
            startHeight + (window.innerHeight - startHeight) * eased;

        const padding = 11 * (1 - eased);

        if (!reduceMotion) {
            frame.style.width = `${width}px`;
            frame.style.height = `${height}px`;
            frame.style.padding = `${padding}px`;

            frame.style.borderColor =
                `rgba(231,185,31,${0.48 * (1 - eased)})`;

            const fade = Math.max(0, 1 - progress / 0.38);

            topHeading.style.opacity = fade;
            bottomHeading.style.opacity = fade;

            topHeading.style.transform =
                `translateY(${-progress * 95}px)`;

            bottomHeading.style.transform =
                `translateY(${progress * 95}px)`;

            hint.style.opacity =
                String(Math.max(0, 1 - progress / 0.12));
        }
    }

    function requestUpdate() {
        if (!scheduled) {
            scheduled = true;
            window.requestAnimationFrame(updateHero);
        }
    }

    window.addEventListener("scroll", requestUpdate, {
        passive: true
    });

    window.addEventListener("resize", requestUpdate);

    updateHero();
})();

/* ==================================
   SUPABASE CONNECTION
================================== */

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);