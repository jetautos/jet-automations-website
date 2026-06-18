// Eagle Aviation — minimal vanilla JS, no dependencies.

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');

navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

// Close the mobile menu after choosing a destination
siteNav.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Links with data-interest preselect the form's interest dropdown,
// e.g. "Book a Discovery Flight" and the VMAX inquiry link.
const interestSelect = document.getElementById('interest');

document.querySelectorAll('a[data-interest]').forEach((link) => {
  link.addEventListener('click', () => {
    interestSelect.value = link.dataset.interest;
  });
});

// Hero photo: if assets/pleasanton-airport.webp exists, use it as the hero
// background (styled in styles.css); otherwise the SVG runway scene stays.
const heroPhoto = new Image();
heroPhoto.onload = () => {
  document.querySelector('.hero').classList.add('has-photo');
};
heroPhoto.src = 'assets/pleasanton-airport.webp';

// Mobile floating CTA: show only when every other Discovery Flight button
// has scrolled off screen; hide again at the contact form.
const mobileCta = document.getElementById('mobile-cta');
const contactSection = document.getElementById('contact');

if (mobileCta) {
  const discoveryCtas = Array.from(
    document.querySelectorAll('a[data-interest="Discovery Flight"]')
  ).filter((link) => !mobileCta.contains(link));

  const visibleCtas = new Set();
  let atContact = false;

  function updateMobileCta() {
    const show = visibleCtas.size === 0 && !atContact;
    mobileCta.classList.toggle('is-visible', show);
    mobileCta.setAttribute('aria-hidden', String(!show));
  }

  discoveryCtas.forEach((cta) => {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        visibleCtas.add(cta);
      } else {
        visibleCtas.delete(cta);
      }
      updateMobileCta();
    }, { threshold: 0 }).observe(cta);
  });

  if (contactSection) {
    new IntersectionObserver(([entry]) => {
      atContact = entry.isIntersecting;
      updateMobileCta();
    }, { threshold: 0.15 }).observe(contactSection);
  }
}

// Point the thank-you redirect at this site's origin (pages.dev or custom domain).
const retUrlField = document.getElementById('retURL');
if (retUrlField) {
  retUrlField.value = `${window.location.origin}/thank-you.html`;
}
