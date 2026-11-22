
/* =========================================================
   KATY & MICHAEL
   COMPLETE WEDDING WEBSITE JAVASCRIPT

   Includes:
   1. Supabase connection
   2. Mobile navigation
   3. Photo gallery lightbox
   4. RSVP submissions
   5. Cinematic scrolling photo animation
========================================================= */


/* =========================================================
   1. SUPABASE CONNECTION
========================================================= */

const SUPABASE_URL =
    "https://pyxfwqtulqrpikkkubyx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_JaQdUZhFBgOSvWiOE2ANzA_aLzNy4vT";

let supabaseClient = null;

if (window.supabase) {

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

} else {

    console.error(
        "Supabase failed to load. Check the Supabase CDN script."
    );

}


/* =========================================================
   2. INITIALIZE WEBSITE FEATURES
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeNavigation();

    initializeGallery();

    initializeRSVP();

    initializeWeddingHero();

});


/* =========================================================
   3. MOBILE NAVIGATION
========================================================= */

function initializeNavigation() {

    const menuToggle =
        document.querySelector(".menu-toggle");

    const nav =
        document.querySelector(".nav");

    if (!menuToggle || !nav) return;


    menuToggle.addEventListener("click", () => {

        const isExpanded =
            menuToggle.getAttribute("aria-expanded") === "true";

        const newState = !isExpanded;

        menuToggle.setAttribute(
            "aria-expanded",
            String(newState)
        );

        nav.classList.toggle("open", newState);

        menuToggle.textContent =
            newState ? "×" : "☰";

    });


    // Close menu when a navigation link is selected.

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


    // Close menu when clicking outside.

    document.addEventListener("click", (event) => {

        if (
            !nav.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            nav.classList.remove("open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.textContent = "☰";

        }

    });

}


/* =========================================================
   4. PHOTO GALLERY LIGHTBOX
========================================================= */

function initializeGallery() {

    const lightbox =
        document.querySelector(".lightbox");

    if (!lightbox) return;

    const largeImage =
        lightbox.querySelector("img");

    const closeButton =
        lightbox.querySelector(".lightbox-close");


    if (!largeImage) return;


    // Open gallery image.

    document.querySelectorAll(".photo-tile").forEach((tile) => {

        tile.addEventListener("click", () => {

            const thumbnail =
                tile.querySelector("img");

            if (!thumbnail) return;

            const fullImage =
                tile.dataset.full || thumbnail.src;

            if (!fullImage) return;

            largeImage.src = fullImage;

            largeImage.alt = thumbnail.alt || "Wedding photo";

            lightbox.classList.add("open");

            lightbox.setAttribute("aria-hidden", "false");

            document.body.style.overflow = "hidden";

        });

    });


    // Close lightbox.

    function closeLightbox() {

        lightbox.classList.remove("open");

        lightbox.setAttribute("aria-hidden", "true");

        largeImage.src = "";

        document.body.style.overflow = "";

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeLightbox
        );

    }


    // Close when clicking outside image.

    lightbox.addEventListener("click", (event) => {

        if (event.target === lightbox) {

            closeLightbox();

        }

    });


    // Close with Escape key.

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            lightbox.classList.contains("open")
        ) {

            closeLightbox();

        }

    });

}


/* =========================================================
   5. RSVP FORM SUBMISSION
========================================================= */

function initializeRSVP() {

    const rsvpForm =
        document.getElementById("rsvp-form");

    const formMessage =
        document.getElementById("form-message");

    if (!rsvpForm || !formMessage) return;

    const saveButton =
        rsvpForm.querySelector('[type="submit"]');


    rsvpForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // Validate form.

        if (!rsvpForm.reportValidity()) return;


        // Check Supabase connection.

        if (!supabaseClient) {

            formMessage.textContent =
                "The RSVP service is temporarily unavailable. Please try again later.";

            return;

        }


        // Collect form information.

        const formData =
            new FormData(rsvpForm);

        const agreementCheckbox =
            rsvpForm.querySelector('[name="agreement"]');


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

            agreement: Boolean(
                agreementCheckbox?.checked
            )

        };


        // Validate agreement.

        if (!rsvp.agreement) {

            formMessage.textContent =
                "Please accept the Rule Agreement before submitting.";

            return;

        }


        // Validate attendance.

        if (!["yes", "no"].includes(rsvp.attending)) {

            formMessage.textContent =
                "Please select whether you will be attending.";

            return;

        }


        // Disable button while submitting.

        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent = "SAVING...";

        }

        formMessage.textContent =
            "Submitting your RSVP...";


        try {

            // Send RSVP to Supabase.

            const { error } = await supabaseClient
                .from("rsvps")
                .insert([rsvp]);


            if (error) {

                console.error(
                    "SUPABASE RSVP ERROR:",
                    error
                );

                throw error;

            }


            // Successful submission.

            console.log(
                "RSVP SUCCESSFULLY SUBMITTED:",
                rsvp
            );

            formMessage.textContent =
                "Thank you! Your RSVP has been received.";

            rsvpForm.reset();


        } catch (error) {

            console.error(
                "RSVP SUBMISSION FAILED:",
                error
            );

            formMessage.textContent =
                "We couldn't save your RSVP. Please try again. If the problem continues, contact the couple.";


        } finally {

            // Restore submit button.

            if (saveButton) {

                saveButton.disabled = false;

                saveButton.textContent = "SAVE RSVP";

            }

        }

    });

}


/* =========================================================
   6. CINEMATIC WEDDING HERO ANIMATION
========================================================= */

function initializeWeddingHero() {

    const stage =
        document.getElementById("hero-stage");

    const sticky =
        document.querySelector(".wedding-hero-sticky");

    const frame =
        document.getElementById("wedding-hero-frame");

    const topHeading =
        document.getElementById("hero-heading-top");

    const bottomHeading =
        document.getElementById("hero-heading-bottom");

    const hint =
        document.getElementById("scroll-hint");


    // Only run on the homepage.

    if (
        !stage ||
        !sticky ||
        !frame ||
        !topHeading ||
        !bottomHeading ||
        !hint
    ) {

        return;

    }


    const photo =
        frame.querySelector(".hero-photo");

    const wash =
        frame.querySelector(".hero-wash");


    // Respect reduced motion preference.

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    let animationScheduled = false;


    /* =====================================================
       FRAME STARTING DIMENSIONS

       These match the CSS breakpoints so that JavaScript
       does not overwrite the mobile frame dimensions.
    ===================================================== */

    function getStartingDimensions() {

        const width = window.innerWidth;

        const height = window.innerHeight;


        // Small mobile.

        if (width <= 480) {

            return {

                width: width * 0.88,

                height: height * 0.48,

                padding: 8

            };

        }


        // Tablet and larger mobile.

        if (width <= 700) {

            return {

                width: width * 0.86,

                height: height * 0.52,

                padding: 8

            };

        }


        // Desktop.

        return {

            width: Math.min(width * 0.84, 940),

            height: Math.min(width * 0.47, height * 0.58),

            padding: 11

        };

    }


    /* =====================================================
       SMOOTH ANIMATION CALCULATION
    ===================================================== */

    function smoothStep(value) {

        return value * value * (3 - 2 * value);

    }


    function clamp(value, min, max) {

        return Math.min(
            max,
            Math.max(min, value)
        );

    }


    /* =====================================================
       MAIN HERO UPDATE
    ===================================================== */

    function updateHero() {

        animationScheduled = false;


        const stageTop =
            stage.getBoundingClientRect().top + window.scrollY;

        const travelDistance = Math.max(
            1,
            stage.offsetHeight - window.innerHeight
        );


        // Calculate scroll progress.

        const progress = clamp(
            (window.scrollY - stageTop) / travelDistance,
            0,
            1
        );


        const eased =
            smoothStep(progress);


        // Starting dimensions.

        const start =
            getStartingDimensions();


        // Ending dimensions.

        const endWidth =
            window.innerWidth;

        const endHeight =
            window.innerHeight;


        // Calculate current dimensions.

        const currentWidth =
            start.width +
            (endWidth - start.width) * eased;

        const currentHeight =
            start.height +
            (endHeight - start.height) * eased;

        const currentPadding =
            start.padding * (1 - eased);


        /* =================================================
           ANIMATE PHOTO FRAME
        ================================================= */

        frame.style.width =
            `${currentWidth}px`;

        frame.style.height =
            `${currentHeight}px`;

        frame.style.padding =
            `${currentPadding}px`;


        // Keep the frame visible throughout the animation.

        const borderOpacity =
            0.9 - (0.35 * eased);

        frame.style.borderColor =
            `rgba(255, 255, 255, ${borderOpacity})`;


        /* =================================================
           ANIMATE PHOTO OVERLAY
        ================================================= */

        if (wash) {

            wash.style.inset =
                `${currentPadding}px`;

        }


        /* =================================================
           PHOTO APPEARANCE
        ================================================= */

        if (photo) {

            const brightness =
                0.67 + (0.18 * eased);

            photo.style.filter =
                `grayscale(${0.72 * (1 - eased)}) brightness(${brightness}) sepia(0.08)`;

        }


        /* =================================================
           HEADING ANIMATION
        ================================================= */

        const headingFade =
            clamp(1 - progress / 0.38, 0, 1);


        topHeading.style.opacity =
            headingFade;

        bottomHeading.style.opacity =
            headingFade;


        // Move upper heading upward.

        topHeading.style.transform =
            `translateY(${-progress * 95}px)`;


        // Move lower heading downward.

        bottomHeading.style.transform =
            `translateY(${progress * 95}px)`;


        /* =================================================
           SCROLL INDICATOR
        ================================================= */

        hint.style.opacity =
            String(clamp(1 - progress / 0.12, 0, 1));


        // Hide scroll indicator after animation.

        hint.style.pointerEvents =
            progress > 0.1 ? "none" : "auto";

    }


    /* =====================================================
       REQUEST ANIMATION FRAME

       Prevents excessive updates while scrolling.
    ===================================================== */

    function requestUpdate() {

        if (animationScheduled) return;

        animationScheduled = true;

        window.requestAnimationFrame(updateHero);

    }


    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    if (!reduceMotion) {

        window.addEventListener(
            "scroll",
            requestUpdate,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            requestUpdate
        );

    }


    /* =====================================================
       INITIALIZE ANIMATION
    ===================================================== */

    updateHero();


    // Recalculate after the page has completely loaded.

    window.addEventListener("load", updateHero);

}


/* =========================================================
   END OF KATY & MICHAEL WEDDING WEBSITE JAVASCRIPT
========================================================= */
