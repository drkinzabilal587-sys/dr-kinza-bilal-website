const menuBtn = document.querySelector(".menu-btn");
const mainNav = document.querySelector(".main-nav");

menuBtn?.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".faq-item button").forEach(button => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item").forEach(x => x.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  });
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("appointmentForm");
const formStatus = document.getElementById("formStatus");

form?.addEventListener("submit", event => {
  event.preventDefault();
  formStatus.textContent =
    "Appointment form is ready. Connect it to Dr. Kinza Bilal's phone, WhatsApp, email or booking system before publishing.";
});
