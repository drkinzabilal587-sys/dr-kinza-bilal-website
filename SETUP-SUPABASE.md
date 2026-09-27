# Dr. Kinza Bilal — CMS and appointment setup

The public site remains on GitHub Pages. Supabase stores appointment requests and editable website copy. The admin panel is at `admin.html` under the same GitHub Pages URL. A database password is never added to website files.

## 1. Create the database tables and security rules

In the **Dr Kinza** Supabase project, open **SQL Editor → New query**. Paste all of `supabase-setup.sql` and run it once. Check that `appointments`, `site_content`, and `admin_users` appear in Table Editor. The public can submit an appointment request, but cannot read patient records. Only approved admin accounts may view requests or edit content.

## 2. Add the public connection settings

In Supabase **Project Settings → API Keys**, copy the **publishable** key (`sb_publishable_...`). Replace `PASTE_YOUR_PUBLISHABLE_KEY_HERE` in `supabase-config.js`. Check the project URL matches the one displayed on the project home screen. The URL and publishable key are intended to be visible in browser code. Never place a secret key, service role key, or database password in GitHub Pages.

## 3. Create the first admin account

In **Authentication → Users**, create/invite the doctor's admin email, then set its password through Supabase's invite/confirmation flow. Keep public signups off unless needed. Copy that user's UUID from the Users list. In **SQL Editor**, run the following with the actual UUID:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID');
```

The Supabase project owner's GitHub login is separate from the website admin login. The database password is also separate.

For an invited account whose original link expired, set **Authentication → URL Configuration → Site URL** to the published `admin.html` URL. After the updated site is live, open the user in **Authentication → Users** and choose **Send password recovery**. Use only the latest recovery email. The `admin.html` page accepts the recovery link and lets the user set a new password; never share the recovery link or password.

## 4. Publish the updated files

Replace the old repository contents with the updated files, keeping `index.html`, `admin.html`, all `.js` and `.css` files, and `assets/` at the root of the `main` branch. GitHub Pages will publish from `main` and `/(root)` as already configured. The address remains:

`https://drkinzabilal587-sys.github.io/dr-kinza-bilal-website/`

The admin URL will be:

`https://drkinzabilal587-sys.github.io/dr-kinza-bilal-website/admin.html`

## 5. Verify

Open the public site in a private browser window, submit one test request (use test data only), then sign in to the admin page. The request should appear and its status should be editable. Edit a heading in the CMS, save, refresh the public page, and confirm it changed. If the request fails, confirm the publishable key and SQL policies before sharing the booking link.

The current CMS edits the main headings, introductory copy, clinic schedule, appointment summaries, and hero image URL. The admin page uses a normal login; its `noindex` tag is for search engines, while actual access control is enforced by Supabase Auth and Row Level Security. The image field accepts a publicly reachable HTTPS image URL; direct file uploads are not included in this version.

Appointment requests are not confirmed bookings. The clinic must contact each patient. The form asks for an optional short note; avoid collecting detailed medical information in this public form. Public forms can receive spam; add rate limiting or a protected Edge Function before using it at high volume.
