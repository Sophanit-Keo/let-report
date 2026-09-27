# Let Report: web app

A working web app built from the Claude Design file `Trouble Report App v2.dc.html`, using the Let Report design system (colours, type, buttons and Lucide icons).

It works in the browser on phones, tablets and computers:

| Screen | Layout |
|---|---|
| Phone (under 768 px) | Same as the design: full screen, bottom tab bar with the green camera button, bottom sheets |
| Tablet (768–1023 px) | Wider pages, 2-column report lists, sheets become centered dialogs, the camera opens as a panel |
| Computer (1024 px and up) | Left sidebar (Report an issue, Home / Reports / Tasks / Alerts, language, role switcher), 2-column home and report detail |

Tested browsers: Chrome, Edge and Samsung Internet (Chrome 87+), Firefox 78+, and Safari on iPhone, iPad and Mac (iOS/Safari 14.5+).

## Database and hosting

The app stores everything in **Supabase** (Postgres database, logins and photo storage) and is hosted on **Vercel**.

**1. Create the database** (once)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the files in `supabase/migrations/` in order (`0001` → `0004`), then deploy the function in `supabase/functions/admin-users` (`supabase functions deploy admin-users`). This creates the tables, the security rules and the private `photos` storage bucket.
3. Optional, for testing: **Authentication → Sign In / Providers → Email**, turn off **Confirm email** so new accounts can sign in straight away.
4. **Project Settings → API**: copy the **Project URL** and the **anon public** key.

**2. Connect the app**
- On your computer: copy `.env.example` to `.env` and paste the two values in.
- On Vercel: add the same two values as **Environment Variables** (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).

**3. Put it online with Vercel**
- Push the `web` folder to GitHub, then in Vercel choose **Add New → Project**, import the repo and click **Deploy**. `vercel.json` already sets the build (`npm run build`, output `dist`).
- Or from this folder: `npx vercel --prod`.

**4. First sign-in**
- The first person to create an account becomes the **plant manager**. Everyone after that starts as **QC**. The manager changes roles in the account menu (tap your avatar).
- The manager can press **Load sample reports** in an empty database to try every step.

### Who can do what (enforced by the database)

| | QC | QA | Supervisor | Manager |
|---|---|---|---|---|
| See all reports, create reports as themselves | ✓ | ✓ | ✓ | ✓ |
| Work on reports (assign, fix, verify, escalate) | ✓ | ✓ | ✓ | ✓ |
| Close a trouble at any stage, with a note (critical ones need manager approval) | ✓ | ✓ | ✓ | approves |
| See alerts meant for their role | ✓ | ✓ | ✓ | ✓ |
| Change a production line's status, output and note | ✓ | ✓ | ✓ | ✓ |
| Add a line, edit its name, type, product and target | ✓ | ✓ | ✓ | ✓ |
| Remove production lines | | | | ✓ |
| Change own name and profile photo | ✓ | ✓ | ✓ | ✓ |
| Team screen: add people, change name/photo/role, turn accounts off, set a new password, remove accounts | | | | ✓ |
| Delete reports | | | | ✓ |

Photos and signatures are stored in a **private** bucket, and the app shows them through links that expire after 6 hours. Data refreshes every 15 seconds and whenever you come back to the app.

## Work on the code

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev      # http://localhost:5173, and a Wi-Fi address you can open on your phone
npm run build    # writes the finished site to dist/
npm run lint     # checks for mistakes (undefined names, unused imports)
```

`npm run dev` and `npm run build` read `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `.env` (or from the environment on Vercel). Without them the app shows \"Not connected to a database yet\".

## Project structure

```
web/
├── index.html                 page shell: fonts, app icon, manifest
├── package.json               scripts and dependencies
├── eslint.config.js           lint rules
├── vercel.json                Vercel build settings
├── .env.example               Supabase settings template (copy to .env)
├── supabase/migrations/       database schema, security rules, storage bucket
├── scripts/
│   └── build.mjs              esbuild build and dev server
├── public/                    copied into dist/ as-is
│   ├── manifest.webmanifest   "Add to Home Screen" settings
│   ├── icons/                 favicon and app icons
│   └── images/                logo and avatars/
├── src/
│   ├── main.jsx               entry point: styles + mounts <App />
│   ├── App.jsx                app shell: sidebar, current screen, tab bar, overlays
│   ├── i18n/                  text: en.js, km.js
│   ├── data/                  constants.js (categories, lines, people, colours), seed.js (demo reports)
│   ├── api/
│   │   ├── supabase.js        small Supabase client: login, database, storage
│   │   └── repo.js            reports/alerts ⇄ database rows
│   ├── state/
│   │   ├── AppController.js   state and actions (sign-in, send, assign, escalate, verify, hold checks); saves to Supabase
│   │   ├── viewModel.js       turns state into what each screen shows
│   │   ├── draft.js           "Add details" form values
│   │   └── storage.js         language preference (this browser)
│   ├── components/            shared UI: Button, Icon, Pill, Field, Avatar, ReportCard, TopBar, Toggle…
│   ├── layout/                Sidebar (computer), TabBar (phone/tablet)
│   ├── screens/               one folder per screen
│   │   ├── team/              team management (managers)
│   │   ├── auth/              sign in, create account, loading
│   │   ├── home/  reports/  tasks/  alerts/
│   │   ├── report-detail/     detail + bottom action bar
│   │   ├── add-details/       form + save bar
│   │   ├── report-sent/
│   │   └── capture/           camera, flows A/B/C, sign step, shared parts
│   ├── sheets/                SheetHost + one file per sheet (account, line, line form, assign, escalate, close, filters, decision, verify)
│   ├── styles/
│   │   ├── tokens/            design-system tokens (colours, type, spacing, effects)
│   │   ├── base.css           fonts, resets, animations, focus states
│   │   ├── layout.css         responsive shell: phone, tablet ≥768px, computer ≥1024px
│   │   ├── index.css          imports everything above
│   │   └── inline.js          shared inline styles (chips, inputs)
│   └── utils/
│       └── tap.js             makes any element a keyboard-accessible button
└── dist/                      built site (generated; not committed to git)
```

**Where to change things:**

- Wording or a translation: `src/i18n/`
- Demo data, product lines or people: `src/data/`
- Workflow rules (who can do what): `src/state/AppController.js`
- A screen's look: `src/screens/<screen>/`
- Colours and spacing: `src/styles/tokens/`

## Features

- **Accounts and roles:** email and password sign-in. QC inspector, QA officer, line supervisor and plant manager each get their own home screen and tasks.
- **Team (managers):** add a person with a temporary password, change anyone's name, photo or role, turn an account off (it can't see anything until turned back on), set a new password, or remove the account. There is always at least one active plant manager.
- **Profile photo:** everyone can change their own photo and name from the account menu (tap your avatar).
- **Two-tap report:** photo, then problem type, then severity, then sign and send. The camera is real: a live preview where the browser allows it, otherwise the phone camera or a photo picker. Critical reports alert QA and the manager.
- **Add details:** location, product type and name, lot, quantity, product hold with a scheduled hold check, trouble, immediate action, suggestion, urgent, support needed, voice note.
- **Workflow:** fix on the spot, close a trouble (QC, QA, Supervisor, with a note), assign corrective action, mark done, verify and close, manager approval, escalation ladder (QC → QA → Supervisor → Manager).
- **Hold checks:** release, or reject and then a QA decision (keep on hold, lab test, reject, other, escalate).
- **Reports:** search, All / Open / Closed, and filters for date, line, product and severity.
- **Production lines:** tap a line under "Lines now" to set its status (Running, Stopped, CIP, Changeover, Maintenance, Idle), update today's output, leave a note for the next shift, and edit the line's name or the product it's running (renaming keeps its reports linked). Anyone can add a line with **+ Add line**; only managers remove lines.
- **Install on phones and tablets:** the app suggests installing itself (Android: an Install button; iPhone/iPad: Share → Add to Home Screen steps). "Not now" hides it for 7 days. A small service worker (`public/sw.js`) makes this possible and opens the app faster; data from Supabase is never cached.
- **English and Khmer** switch at the top.
- Everything is saved in the Supabase database and shared between all devices.

### Start options in the link

- `?lang=km`: start in Khmer
- `?flow=B`: report flow variant from the design: `A` overlay chips (default), `B` step cards, `C` one sheet

### Still simulated

The voice note is still simulated. Hold-check reminders appear when the app is opened on or after the due day, and no push notifications are sent yet.
