// Eagle Aviation — Student Pilot Resources page

const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('site-nav-mobile');
const bars = navToggle?.querySelectorAll('.nav-bar');

navToggle?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('hidden') === false;
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (bars?.length === 3) {
    bars[0].style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
    bars[1].style.opacity = open ? '0' : '1';
    bars[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
  }
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.add('hidden');
    navToggle?.setAttribute('aria-expanded', 'false');
    if (bars?.length === 3) {
      bars[0].style.transform = '';
      bars[1].style.opacity = '1';
      bars[2].style.transform = '';
    }
  });
});

const mobileCta = document.getElementById('mobile-cta');
const finalCta = document.getElementById('get-started');
const hero = document.querySelector('.hero-glow');

if (mobileCta && hero) {
  let pastHero = false;
  let atFinal = false;

  function updateSticky() {
    const show = pastHero && !atFinal;
    mobileCta.classList.toggle('translate-y-full', !show);
    mobileCta.classList.toggle('translate-y-0', show);
    mobileCta.setAttribute('aria-hidden', String(!show));
  }

  new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting;
    updateSticky();
  }, { threshold: 0 }).observe(hero);

  if (finalCta) {
    new IntersectionObserver(([entry]) => {
      atFinal = entry.isIntersecting;
      updateSticky();
    }, { threshold: 0.2 }).observe(finalCta);
  }
}