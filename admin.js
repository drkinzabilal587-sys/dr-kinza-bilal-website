const db = window.kinzaClient?.();
const loginPanel = document.getElementById("loginPanel");
const resetPanel = document.getElementById("resetPanel");
const resetStatus = document.getElementById("resetStatus");
const adminPanel = document.getElementById("adminPanel");
const loginStatus = document.getElementById("loginStatus");
const adminStatus = document.getElementById("adminStatus");
const logout = document.getElementById("logout");
const fields = document.getElementById("contentFields");
const appointments = document.getElementById("appointments");
let activeUser = null;
let passwordRecovery = new URLSearchParams(location.hash.slice(1)).get("type") === "recovery";

if (!db) loginStatus.textContent = "Supabase publishable key has not been configured yet.";

async function showSession() {
  if (!db) return;
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return showLogin();
  if (passwordRecovery) {
    loginPanel.hidden = true;
    resetPanel.hidden = false;
    adminPanel.hidden = true;
    logout.hidden = true;
    return;
  }
  const { data: admin, error: adminError } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (adminError || !admin) {
    await db.auth.signOut();
    showLogin("This account has not been approved as an administrator.");
    return;
  }
  activeUser = user;
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  logout.hidden = false;
  await Promise.all([loadAppointments(), loadContent()]);
}

function showLogin(message = "") {
  activeUser = null;
  loginPanel.hidden = false;
  resetPanel.hidden = true;
  adminPanel.hidden = true;
  logout.hidden = true;
  loginStatus.textContent = message;
  fields.replaceChildren();
  appointments.replaceChildren();
}

if (db) db.auth.onAuthStateChange(event => {
  if (event === "PASSWORD_RECOVERY") {
    passwordRecovery = true;
    showSession();
  }
});

document.getElementById("resetForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!db) return;
  const password = String(new FormData(event.currentTarget).get("password"));
  resetStatus.textContent = "Saving…";
  const { error } = await db.auth.updateUser({ password });
  event.currentTarget.reset();
  if (error) { resetStatus.textContent = "Could not save password. Request a new recovery email."; return; }
  await db.auth.signOut();
  passwordRecovery = false;
  history.replaceState(null, "", location.pathname);
  showLogin("Password saved. Sign in with your new password.");
});

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!db) return;
  loginStatus.textContent = "Signing in…";
  const form = new FormData(event.currentTarget);
  const { error } = await db.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
  event.currentTarget.querySelector('input[name="password"]').value = "";
  if (error) { loginStatus.textContent = "Sign in failed. Check your credentials."; return; }
  loginStatus.textContent = "";
  await showSession();
});
logout.addEventListener("click", async () => { await db.auth.signOut(); showLogin(); });
document.getElementById("refresh").addEventListener("click", loadAppointments);

async function loadAppointments() {
  if (!activeUser) return;
  const { data, error } = await db.from("appointments").select("id,created_at,patient_name,phone,location,preferred_date,message,status").order("created_at", { ascending: false }).limit(200);
  appointments.replaceChildren();
  if (error) { adminStatus.textContent = "Could not load appointments."; return; }
  adminStatus.textContent = "";
  if (!data.length) {
    const row = appointments.insertRow(); row.insertCell().colSpan = 7; row.cells[0].textContent = "No requests yet.";
  }
  for (const item of data) {
    const row = appointments.insertRow();
    [new Date(item.created_at).toLocaleString("en-PK"), item.patient_name, item.phone, item.location, item.preferred_date || "—", item.message || "—"].forEach(value => {
      row.insertCell().textContent = value;
    });
    const cell = row.insertCell();
    const select = document.createElement("select");
    ["new", "contacted", "confirmed", "cancelled"].forEach(value => {
      const option = new Option(value[0].toUpperCase() + value.slice(1), value);
      select.add(option);
    });
    select.value = item.status;
    select.addEventListener("change", async () => {
      select.disabled = true;
      const { error } = await db.from("appointments").update({ status: select.value }).eq("id", item.id);
      select.disabled = false;
      if (error) { select.value = item.status; adminStatus.textContent = "Status could not be saved."; }
      else { item.status = select.value; adminStatus.textContent = "Appointment updated."; }
    });
    cell.append(select);
  }
}

async function loadContent() {
  if (!activeUser) return;
  const { data, error } = await db.from("site_content").select("key,value");
  if (error) { adminStatus.textContent = "Could not load website content."; return; }
  const saved = new Map((data || []).map(item => [item.key, item.value]));
  fields.replaceChildren();
  for (const [key, label, selector, type] of window.KINZA_CMS_FIELDS) {
    const wrapper = document.createElement("div"); wrapper.className = "field";
    const caption = document.createElement("label"); caption.textContent = label;
    const input = document.createElement(type === "image" ? "input" : "textarea");
    input.maxLength = type === "image" ? 1000 : 1000;
    input.value = saved.get(key) ?? (type === "image" ? document.querySelector(selector)?.getAttribute("src") : document.querySelector(selector)?.textContent.trim()) ?? "";
    const button = document.createElement("button"); button.type = "button"; button.textContent = "Save";
    const status = document.createElement("small");
    button.addEventListener("click", async () => {
      const value = input.value.trim();
      if (type === "image") {
        try { if (new URL(value).protocol !== "https:") throw Error(); }
        catch { status.textContent = "Use a full HTTPS image URL."; return; }
      }
      button.disabled = true; status.textContent = "Saving…";
      const { error } = await db.from("site_content").upsert({ key, value }, { onConflict: "key" });
      button.disabled = false; status.textContent = error ? "Save failed." : "Saved. Refresh the public site to see it.";
    });
    caption.append(input); wrapper.append(caption, button, status); fields.append(wrapper);
  }
}
showSession();
