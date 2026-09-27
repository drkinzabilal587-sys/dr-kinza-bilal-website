// Each entry points to an existing piece of the website. Admin changes override its original text.
window.KINZA_CMS_FIELDS = [
  ["hero_title", "Home · Main heading", ".hero h1"],
  ["hero_intro", "Home · Introduction", ".hero-copy > p"],
  ["hero_image", "Home · Image URL", ".hero-visual img", "image"],
  ["about_title", "About · Heading", "#about h2"],
  ["about_intro", "About · Short introduction", "#about .lead"],
  ["about_body", "About · Description", "#about .lead + p"],
  ["about_quote", "About · Quote", "#about .quote-card p"],
  ["expertise_title", "Expertise · Heading", "#expertise h2"],
  ["locations_title", "Locations · Heading", "#locations h2"],
  ["locations_intro", "Locations · Note", "#locations .section-head > p"],
  ["dhq_name", "Locations · DHQ name", "#locations .location-card:nth-child(1) h3"],
  ["dhq_image", "Locations · DHQ image URL", "#locations .location-card:nth-child(1) img", "image"],
  ["dhq_days", "Locations · DHQ days", "#locations .location-card:nth-child(1) .clinic-days"],
  ["dhq_time", "Locations · DHQ timing", "#locations .location-card:nth-child(1) strong"],
  ["dhq_note", "Locations · DHQ note", "#locations .location-card:nth-child(1) p:last-child"],
  ["sarmad_name", "Locations · Sarmad name", "#locations .location-card:nth-child(2) h3"],
  ["sarmad_image", "Locations · Sarmad image URL", "#locations .location-card:nth-child(2) img", "image"],
  ["sarmad_days", "Locations · Sarmad days", "#locations .location-card:nth-child(2) strong"],
  ["sarmad_time", "Locations · Sarmad timing", "#locations .location-card:nth-child(2) p:last-child"],
  ["iqbal_name", "Locations · Iqbal name", "#locations .location-card:nth-child(3) h3"],
  ["iqbal_image", "Locations · Iqbal image URL", "#locations .location-card:nth-child(3) img", "image"],
  ["iqbal_time", "Locations · Iqbal timing", "#locations .location-card:nth-child(3) strong"],
  ["iqbal_note", "Locations · Iqbal note", "#locations .location-card:nth-child(3) p:last-child"],
  ["kidney_title", "Kidney Health · Heading", "#kidney-health h2"],
  ["kidney_image", "Kidney Health · Banner URL", "#kidney-health img", "image"],
  ["faq_title", "FAQ · Heading", "#faq h2"],
  ["appointment_title", "Appointments · Heading", "#appointment h2"],
  ["appointment_intro", "Appointments · Explanation", "#appointment .appointment-grid > div > p"],
  ["schedule_dhq", "Appointments · DHQ summary", ".schedule-summary p:nth-child(1)"],
  ["schedule_sarmad", "Appointments · Sarmad summary", ".schedule-summary p:nth-child(2)"],
  ["schedule_iqbal", "Appointments · Iqbal summary", ".schedule-summary p:nth-child(3)"]
];

window.kinzaClient = function () {
  const key = window.KINZA_SUPABASE_PUBLISHABLE_KEY;
  if (!window.supabase || !key || key.startsWith("PASTE_")) return null;
  return window.supabase.createClient(window.KINZA_SUPABASE_URL, key);
};

window.kinzaApplyContent = function (rows) {
  for (const row of rows) {
    const field = window.KINZA_CMS_FIELDS.find(item => item[0] === row.key);
    if (!field) continue;
    const element = document.querySelector(field[2]);
    if (!element) continue;
    if (field[3] === "image") {
      try {
        const url = new URL(row.value, location.href);
        if (!["https:", "http:"].includes(url.protocol)) continue;
        element.src = url.href;
      } catch { /* Ignore an invalid image URL. */ }
    } else {
      element.textContent = row.value;
    }
  }
};
