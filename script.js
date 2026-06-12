/* ============================================================
   Granato Co. — interactions
   ============================================================ */

// ---------- Sticky nav shadow ----------
const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 8);
});

// ---------- Mobile menu ----------
const burger = document.getElementById("navBurger");
const navLinks = document.getElementById("navLinks");
burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  burger.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  })
);

// ---------- Scroll reveal ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Stat counters ----------
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCount(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  if (prefersReducedMotion || target === 0) {
    el.textContent = target + suffix;
    return;
  }
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll(".stat__num").forEach((el) => statObserver.observe(el));

// ---------- Hero chat demo (looping conversation) ----------
const chatBody = document.getElementById("chatBody");

const conversation = [
  { who: "user", text: "Hey! Which deals need my attention today? 👀" },
  { who: "bot", text: "3 hot ones 🔥 Acme Corp ($45k) hasn't been touched in 9 days — want me to draft a follow-up?" },
  { who: "user", text: "Yes please, and log it on the opportunity." },
  { who: "bot", text: "Done! ✅ Draft's in your inbox + activity logged. Anything else, boss?" },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function addMessage(who, text) {
  const msg = document.createElement("div");
  msg.className = `chat__msg chat__msg--${who}`;
  msg.textContent = text;
  chatBody.appendChild(msg);
}

function addTyping() {
  const typing = document.createElement("div");
  typing.className = "chat__msg chat__msg--bot chat__msg--typing";
  typing.innerHTML = "<i></i><i></i><i></i>";
  chatBody.appendChild(typing);
  return typing;
}

async function playChat() {
  if (prefersReducedMotion) {
    conversation.forEach(({ who, text }) => addMessage(who, text));
    return;
  }
  // Loop the conversation forever
  for (;;) {
    chatBody.innerHTML = "";
    await wait(600);
    for (const { who, text } of conversation) {
      if (who === "bot") {
        const typing = addTyping();
        await wait(1100);
        typing.remove();
      } else {
        await wait(900);
      }
      addMessage(who, text);
    }
    await wait(5000);
  }
}
playChat();

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();
