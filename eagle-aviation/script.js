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

// Guard: while the form action still holds the placeholder, block submission
// so the live site never POSTs nowhere. This disables itself automatically
// once the real Salesforce Web-to-Lead action URL is in place.
const leadForm = document.getElementById('lead-form');
const formStatus = document.querySelector('.form-status');

leadForm.addEventListener('submit', (event) => {
  if (leadForm.getAttribute('action').includes('REPLACE_WITH')) {
    event.preventDefault();
    formStatus.textContent =
      'This form is not connected yet. Please check back soon.';
  }
});
