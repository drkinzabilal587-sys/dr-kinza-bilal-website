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
const client = window.kinzaClient?.();

if (client) {
  client.from("site_content").select("key,value").then(({ data, error }) => {
    if (error) return console.error("Website content could not load:", error.message);
    window.kinzaApplyContent(data || []);
    ["dhq_name", "sarmad_name", "iqbal_name"].forEach((key, index) => {
      const name = data?.find(item => item.key === key)?.value;
      const option = form?.querySelectorAll('select[name="location"] option')[index + 1];
      if (name && option) option.textContent = option.value = name;
    });
  });
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!client) {
    formStatus.textContent = "Online booking is being set up. Please try again later.";
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  const values = new FormData(form);
  const name = String(values.get("name") || "").trim();
  const phone = String(values.get("phone") || "").trim();
  const location = String(values.get("location") || "").trim();
  if (name.length < 2 || name.length > 100 || !/^[+0-9()\s-]{8,25}$/.test(phone) || !location) {
    formStatus.textContent = "Please enter a valid name, phone number and clinic.";
    return;
  }
  button.disabled = true;
  formStatus.textContent = "Sending your request…";
  const { error } = await client.from("appointments").insert({
    patient_name: name,
    phone,
    location,
    preferred_date: values.get("date") || null,
    message: String(values.get("message") || "").trim().slice(0, 500)
  });
  button.disabled = false;
  if (error) {
    console.error("Appointment request failed:", error.message);
    formStatus.textContent = "Request could not be sent. Please try again later.";
    return;
  }
  form.reset();
  formStatus.textContent = "Request received. The clinic will contact you to confirm availability.";
});
