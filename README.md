# Katy & Michael Wedding Website

A responsive multi-page HTML/CSS/JavaScript recreation of the supplied wedding website mockups.

## Pages
- `index.html` — home page and wedding date
- `info.html` — timeline, rules, and FAQ accordion sections
- `photos.html` — responsive photo gallery with a lightbox
- `rsvp.html` — RSVP form with attendance choices and dietary/rule sections

## Run it
Open `index.html` in a browser. No build tools are required. Google Fonts are loaded online; fallback fonts are included.

## Important RSVP note
The RSVP page is front-end only. Submitting validates the form and offers a downloadable JSON copy in the browser, but does **not** send responses to the couple. To collect RSVPs centrally, connect the form to a backend or form service (for example, Supabase with an appropriate table and Row Level Security policies).

## Before publishing
- Confirm the venue address and schedule.
- Replace the sample FAQ answers and RSVP deadline with final details.
- Add the full set of approved photos.
- Connect the RSVP form to a secure response store and test it.
- Deploy the folder to your preferred static host.

## Cinematic wedding hero
The home page now includes an Aurelia-inspired scroll-expanding hero adapted to plain HTML, CSS, and JavaScript. It does not require React, Tailwind, or npm. The photo frame expands as visitors scroll, and the heading fades away. The effect respects reduced-motion preferences. Replace `assets/couple-hero.jpg` with your preferred hero image if desired, keeping the same filename.
