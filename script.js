
/* =========================================================
   KATY & MICHAEL
   WEDDING WEBSITE JAVASCRIPT
========================================================= */


/* =========================================================
   1. SUPABASE CONNECTION
========================================================= */

const SUPABASE_URL =
    "https://pyxfwqtulqrpikkkubyx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_JaQdUZhFBgOSvWiOE2ANzA_aLzNy4vT";

if (!window.supabase) {
    throw new Error(
        "Supabase library failed to load. Check the Supabase script tag in your HTML."
    );
}

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================================
   2. MOBILE NAVIGATION
========================================================= */

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

            menuToggle.textContent =
                isExpanded ? "☰" : "×";

        });


        // Close mobile navigation after selecting a link

        nav.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                nav.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.textContent = "☰";

            });

        });

    }


    /* =====================================================
       3. GALLERY LIGHTBOX
    ===================================================== */

    const lightbox = document.querySelector(".lightbox");

    if (lightbox) {

        const largeImage = lightbox.querySelector("img");

        const closeButton =
            lightbox.querySelector(".lightbox-close");


        const closeLightbox = () => {

            lightbox.classList.remove("open");

            lightbox.setAttribute("aria-hidden", "true");

            if (largeImage) {
                largeImage.src = "";
            }

        };


        // Open gallery images

        document.querySelectorAll(".photo-tile").forEach((tile) => {

            tile.addEventListener("click", () => {

                if (!largeImage) return;

                const thumbnail = tile.querySelector("img");

                const fullImage =
                    tile.dataset.full ||
                    thumbnail?.src;

                if (!fullImage) return;

                largeImage.src = fullImage;

                largeImage.alt = thumbnail
                    ? thumbnail.alt
                    : "Wedding photo";

                lightbox.classList.add("open");

                lightbox.setAttribute("aria-hidden", "false");

            });

        });


        // Close button

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeLightbox
            );

        }


        // Close when clicking outside the image

        lightbox.addEventListener("click", (event) => {

            if (event.target === lightbox) {

                closeLightbox();

            }

        });


        // Close with Escape key

        document.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {

                closeLightbox();

            }

        });

    }

});


/* =========================================================
   4. RSVP FORM SUBMISSION
========================================================= */

const rsvpForm =
    document.getElementById("rsvp-form");

const formMessage =
    document.getElementById("form-message");

const saveButton =
    rsvpForm?.querySelector('[type="submit"]');


if (rsvpForm && formMessage && saveButton) {

    rsvpForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        /* -----------------------------------------------
           VALIDATE FORM
        ----------------------------------------------- */

        if (!rsvpForm.reportValidity()) {
            return;
        }


        /* -----------------------------------------------
           COLLECT FORM INFORMATION
        ----------------------------------------------- */

        const formData = new FormData(rsvpForm);

        const rsvp = {

            name: String(
                formData.get("name") || ""
            ).trim(),

            guest_name: String(
                formData.get("guestName") || ""
            ).trim(),

            phone: String(
                formData.get("phone") || ""
            ).trim(),

            email: String(
                formData.get("email") || ""
            ).trim(),

            attending: formData.get("attending"),

            agreement:
                formData.get("agreement") === "on"

        };


        /* -----------------------------------------------
           CHECK AGREEMENT
        ----------------------------------------------- */

        if (!rsvp.agreement) {

            formMessage.textContent =
                "Please accept the Rule Agreement before submitting.";

            return;

        }


        /* -----------------------------------------------
           CHECK ATTENDANCE
        ----------------------------------------------- */

        if (!["yes", "no"].includes(rsvp.attending)) {

            formMessage.textContent =
                "Please select whether you will be attending.";

            return;

        }


        /* -----------------------------------------------
           PREPARE SUBMISSION
        ----------------------------------------------- */

        saveButton.disabled = true;

        saveButton.textContent = "SAVING...";

        formMessage.textContent =
            "Submitting your RSVP...";


        /* -----------------------------------------------
           SEND RSVP TO SUPABASE
        ----------------------------------------------- */

        try {

            const { error, status } = await supabaseClient
                .from("rsvps")
                .insert([rsvp]);


            console.log(
                "SUPABASE RESPONSE STATUS:",
                status
            );


            if (error) {

                console.error(
                    "SUPABASE INSERT ERROR:",
                    error
                );

                throw error;

            }


            /* -------------------------------------------
               SUCCESSFUL SUBMISSION
            ------------------------------------------- */

            console.log(
                "RSVP SUCCESSFULLY SUBMITTED:",
                rsvp
            );

            formMessage.textContent =
                "Thank you! Your RSVP has been received.";

            rsvpForm.reset();


        } catch (error) {

            /* -------------------------------------------
               SUBMISSION FAILED
            ------------------------------------------- */

            console.error(
                "RSVP SUBMISSION FAILED:",
                {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    status: error.status
                }
            );


            formMessage.textContent =
                "We couldn't save your RSVP. Please try again. " +
                "If the problem continues, contact the couple.";


        } finally {

            /* -------------------------------------------
               RESTORE SUBMIT BUTTON
            ------------------------------------------- */

            saveButton.disabled = false;

            saveButton.textContent = "SAVE RSVP";

        }

    });

}


/* =========================================================
   5. SCROLL-LINKED HERO ANIMATION
========================================================= */

(() => {

    const stage =
        document.getElementById("hero-stage");

    const frame =
        document.getElementById("wedding-hero-frame");

    const topHeading =
        document.getElementById("hero-heading-top");

    const bottomHeading =
        document.getElementById("hero-heading-bottom");

    const hint =
        document.getElementById("scroll-hint");


    // Stop if this page doesn't contain the hero elements

    if (
        !stage ||
        !frame ||
        !topHeading ||
        !bottomHeading ||
        !hint
    ) {

        return;

    }


    /* -----------------------------------------------
       REDUCED MOTION ACCESSIBILITY
    ----------------------------------------------- */

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    let scheduled = false;


    /* -----------------------------------------------
       UPDATE HERO BASED ON SCROLL POSITION
    ----------------------------------------------- */

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


        // Smooth easing

        const eased =
            progress * progress * (3 - 2 * progress);


        /* -------------------------------------------
           INITIAL FRAME DIMENSIONS
        ------------------------------------------- */

        const startWidth = Math.min(
            window.innerWidth * 0.84,
            940
        );

        const startHeight = Math.min(
            window.innerWidth * 0.47,
            window.innerHeight * 0.58
        );


        /* -------------------------------------------
           ANIMATE FRAME DIMENSIONS
        ------------------------------------------- */

        const width =
            startWidth +
            (window.innerWidth - startWidth) * eased;

        const height =
            startHeight +
            (window.innerHeight - startHeight) * eased;

        const padding = 11 * (1 - eased);


        if (!reduceMotion) {

            frame.style.width =
                `${width}px`;

            frame.style.height =
                `${height}px`;

            frame.style.padding =
                `${padding}px`;


            /* ---------------------------------------
               FRAME BORDER
            --------------------------------------- */

            frame.style.borderColor =
                `rgba(231,185,31,${0.48 * (1 - eased)})`;


            /* ---------------------------------------
               HEADING FADE
            --------------------------------------- */

            const fade = Math.max(
                0,
                1 - progress / 0.38
            );

            topHeading.style.opacity = fade;

            bottomHeading.style.opacity = fade;


            /* ---------------------------------------
               HEADING MOVEMENT
            --------------------------------------- */

            topHeading.style.transform =
                `translateY(${-progress * 95}px)`;

            bottomHeading.style.transform =
                `translateY(${progress * 95}px)`;


            /* ---------------------------------------
               SCROLL HINT FADE
            --------------------------------------- */

            hint.style.opacity = String(
                Math.max(0, 1 - progress / 0.12)
            );

        }

    }


    /* -----------------------------------------------
       REQUEST ANIMATION FRAME
    ----------------------------------------------- */

    function requestUpdate() {

        if (!scheduled) {

            scheduled = true;

            window.requestAnimationFrame(updateHero);

        }

    }


    /* -----------------------------------------------
       SCROLL AND RESIZE LISTENERS
    ----------------------------------------------- */

    window.addEventListener(
        "scroll",
        requestUpdate,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        requestUpdate
    );


    // Initial animation position

    updateHero();

})();
