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
2. Open **SQL Editor** and run the files in `supabase/migrations/` in order (`0001` → `0011`), then deploy the two functions: `supabase functions deploy admin-users` and `supabase functions deploy push --no-verify-jwt`. For push notifications, also run once in the SQL Editor: `select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');` (the notification keys are made automatically the first time). This creates the tables, the security rules and the private `photos` storage bucket.
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
| Team room chat; private chat with any one person (only the two of them can read it) | ✓ | ✓ | ✓ | ✓ |
| Comment on any trouble; delete their own comments and messages | ✓ | ✓ | ✓ | ✓ |
| Turn push notifications on or off for their own devices | ✓ | ✓ | ✓ | ✓ |
| Change a production line's status, output and note | ✓ | ✓ | ✓ | ✓ |
| Start a lot on a line, finish it (the line goes into CIP) and record the lot's details | ✓ | ✓ | ✓ | ✓ |
| View a lot's details; add, edit and delete its events; edit the lot's info (every change is kept in the change log) | ✓ | ✓ | ✓ | ✓ |
| Delete a lot record (the change log keeps it) | | | | ✓ |
| Change the production plan (run choices, maximum run, CIP times) | | | ✓ | ✓ |
| Change or delete the change log | | | | |
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
├── supabase/functions/        admin-users (team accounts), push (sends push notifications)
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
│   │   ├── realtime.js        live updates over one WebSocket (new messages, comments, changes; who's online)
│   │   └── repo.js            reports/alerts ⇄ database rows
│   ├── state/
│   │   ├── AppController.js   state and actions (sign-in, send, assign, escalate, verify, hold checks); saves to Supabase
│   │   ├── viewModel.js       turns state into what each screen shows
│   │   ├── chat.js            chat + comment actions (mixed into AppController)
│   │   ├── push.js            push notifications on/off, test, open the screen a notification points to
│   │   ├── tour.js            the "How to use" guide: steps, start, skip, remember it was seen
│   │   ├── chatView.js        what the Chat screen and a trouble's Discussion show
│   │   ├── draft.js           "Add details" form values
│   │   └── storage.js         language preference (this browser)
│   ├── components/            shared UI: Button, Icon, Pill, Field, Avatar, ReportCard, TopBar, Toggle…
│   ├── layout/                Sidebar (computer), TabBar (phone/tablet)
│   ├── screens/               one folder per screen
│   │   ├── team/              team management (managers)
│   │   ├── chat/              team room + 1-to-1 chat
│   │   ├── auth/              sign in, create account, loading
│   │   ├── home/  reports/  tasks/  alerts/
│   │   ├── report-detail/     detail, discussion (comments) + bottom action bar
│   │   ├── add-details/       form + save bar
│   │   ├── report-sent/
│   │   └── capture/           camera, flows A/B/C, sign step, shared parts
│   ├── sheets/                SheetHost + one file per sheet (account, line, line form, assign, escalate, close, filters, decision, verify)
│   ├── styles/
│   │   ├── tokens/            design-system tokens (colours, type, spacing, effects)
│   │   ├── base.css           fonts, resets, animations, focus states
│   │   ├── layout.css         responsive shell: phone, tablet ≥768px, computer ≥1024px
│   │   ├── chat.css           chat screen, message bubbles, composer, discussion
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
- **Lots and CIP:** each line card shows what it is doing now: *Running lot 270706-K2 · 3 h 20 min*, or the CIP countdown after a lot (*CIP · 2 h 10 min left · ends 16:30*). In the line sheet, **Start lot** sets the lot number and product and puts the line on Running. **Finish lot** records the lot's end (output, who, when, how long it ran, a note) and puts the line into CIP for 4 hours as standard; for maintenance or a system error you choose a longer time and the reason, and **+1 h / +2 h / +4 h** extend a CIP that is taking longer. Picking the *Cleaning (CIP)* status while a lot is running also opens Finish lot, so no lot end goes unrecorded. The **Lot history** on each line lists the lots that ended there (table `line_lots`).
- **Start time of a lot:** **Start lot** asks when the lot started (now by default, or earlier if it is recorded late; not in the future). A running lot can be corrected with **Change start time**. The run time, the CIP filling clock and the lot record all count from it, and the line card shows *Started 06:00*. **Finish lot** likewise asks when the lot ended (now by default; after the start and not in the future). The lot record keeps it, the over-maximum check uses it, and the CIP after the lot counts from it, so a lot recorded 2 hours late shows a 4-hour CIP with 2 hours left.
- **Run time of a lot:** when starting a lot you pick the planned run: 24, 28, 32 or 36 hours (or type another number). 36 hours is the normal maximum for each line (change it in **Edit line info**). The card shows the run against its plan (*25 h / 36 h*), turns amber near the end and red past the maximum. Running past the maximum is allowed as a special case, but **Finish lot** then asks why, and the reason is kept with the lot.
- **CIP filling:** some lines can fill only for a set time. UHT line 1 needs a CIP filling every 24 hours, then the same lot continues. The card shows when the next CIP filling is due and turns red when it is. **Start CIP filling** cleans the filler while the lot stays on the line; **Continue lot** carries on with the same lot and restarts the 24-hour clock. Set it per line in **Edit line info** (*CIP filling during a lot*).
- **Lot details:** tap a lot in **Lot history**, or **Details** on the running lot. It shows the lot's facts (line, product, start, end, run time against the plan, output, CIP), its **events** and its **change log**. Events are written as things happen: start, the status buttons while the lot runs (Stopped, Running again…), CIP filling, continue and finish. Anyone can **add** an event (Stopped, Running again, Maintenance, CIP filling, Continued, Note), **edit** one (time, hours, status or CIP reason, note) or **delete** one; start and finish can be moved but not deleted, and an event must fall inside the lot. **Edit lot info** changes the lot number, product, output, planned run and notes. The **change log** lists every create, edit and delete (*Start time: 06:00 → 05:30*, who, when). The database writes it with triggers (table `lot_log`), so nobody can change or delete it, and it keeps a lot even after a manager deletes the lot.
- **Production plan:** **Plan** next to *+ Add line* opens the factory's plan: the planned-run choices (24, 28, 32, 36 h), the normal maximum for new lines (36 h), the standard CIP after a lot (4 h), the CIP filling time (2 h) and when a CIP filling is needed (24 h). Line supervisors and the plant manager can change it; everyone else sees it read-only. Changes are in the plan's change history.
- **If the database is behind the app:** a missing lot table or column no longer stops the app from loading. Lines and reports still show, and the line sheet says the database update is needed.
- **Install on phones and tablets:** the app suggests installing itself (Android: an Install button; iPhone/iPad: Share → Add to Home Screen steps). "Not now" hides it for 7 days. A small service worker (`public/sw.js`) makes this possible and opens the app faster; data from Supabase is never cached.
- **Live chat:** a team room for everyone plus private 1-to-1 chats, with text and photos, unread badges, a green dot for who is online, and a pop-up when a message arrives on another screen. Messages appear instantly (Supabase Realtime); if the live connection drops, the app catches up on its own. People can delete their own messages.
- **Discussion on each trouble:** comments with text and photos at the bottom of a report. The reporter, everyone who commented before, and the role the trouble is with now get an alert.
- **Push notifications:** turn them on from the card on Home or in the account menu (each phone, tablet or computer separately; iPhone/iPad need the app added to the Home Screen first). You get a notification for chat messages, comments, new troubles, critical troubles, escalations, corrective actions assigned to you or sent back, actions ready to verify, and troubles closed, even when the app is closed. Tapping it opens that trouble or chat. When the app is open on screen you see it in the app instead. The database sends them (a trigger calls the `push` function), so they arrive no matter who made the change.
- **How-to guide:** new people get a short guided tour the first time they sign in. It highlights each part of the app (report button, reports, tasks, chat, alerts, lines, account) with a role-specific explanation. **Skip** at any step; it won't show again (saved on the profile, so not on other devices either). Open it again any time from the account menu: **How to use Let Report**.
- **English and Khmer** switch at the top.
- Everything is saved in the Supabase database and shared between all devices.

### Start options in the link

- `?lang=km`: start in Khmer
- `?flow=B`: report flow variant from the design: `A` overlay chips (default), `B` step cards, `C` one sheet

### Still simulated

The voice note is still simulated. Hold-check reminders appear when the app is opened on or after the due day, and no push notifications are sent yet.
