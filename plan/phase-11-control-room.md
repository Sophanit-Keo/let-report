# Phase 11 · The control-room look

Let Report gets the same modern look as the UHT milk plant simulation: a dark control room, with the light design kept as it is ([the simulation's card](https://github.com/Sophanit-Keo/simulation-milk-process/blob/master/plan/agent-plan/phase-11-control-room.md)). Nothing the app shows or does changes; only how it looks.

## The look

- **Dark by default, light kept.** `index.html` sets `<html data-theme>` before the CSS loads, from `prefs.theme` (`src/state/storage.js`), else `dark`, and sets the `theme-color` to match. A Light/Dark switch, next to the language switch, changes it and saves it.
- **Dark:** a near-black graphite page, cards with a 1 px border and soft glow-free depth, cyan for selection, focus and links, the brand green for "Report an issue", glowing status dots, tinted (never solid) status chips, large numbers on the line cards and stats.
- **Light:** exactly today's design.
- **Fixed:** what every screen shows, its text in English and Khmer, `tap()` behaviour, keyboard focus, and the layout on phone, tablet and computer.

## Contract (`lead`, before the agents start)

`web/src/styles/tokens/theme.css`: the colours by what they are for, in both themes.

| Token | For |
|---|---|
| `--c-bg`, `--c-surface`, `--c-raised`, `--c-field`, `--c-tint` | The page; cards, sheets, bars; rows and idle chips; inputs and idle pills; a soft highlight |
| `--c-ink`, `--c-ink-2`, `--c-muted`, `--c-on-dark` | Text: main, secondary, hints; text on a surface dark in both themes (camera, photos) |
| `--c-line`, `--c-line-soft` | Borders; dividers inside a card |
| `--c-accent`, `--c-accent-hover`, `--c-accent-ink`, `--c-accent-soft` | Links, primary buttons, focus; text on them; an accent tint |
| `--c-selected-bg`, `--c-selected-ink`, `--c-selected-line` | A selected pill, tab or option |
| `--c-brand`, `--c-brand-hover`, `--c-brand-ink` | The green action |
| `--c-ok`, `--c-warn`, `--c-bad`, `--c-info` and their `-ink`, `-bg` | A state's mark, its text, its background |
| `--c-glow-ok`, `--c-glow-warn`, `--c-glow-bad`, `--c-glow-accent` | The dark theme's glows (none in light) |
| `--c-scrim`, `--c-shadow` | Behind a sheet; shadows |

The rule: **no hex colour and no hue name (`--navy-900`, `--blue-50`, `#fff`…) for a surface, text, border or state** in components, screens, sheets or view models; only `--c-*`. The dark theme remaps the hue names as a safety net, but a dark hue used as a background (a selected navy pill with white text) only works through `--c-selected-*`. `src/styles/inline.js` already uses the tokens.

## Who does what

Three `lr-ui` agents in parallel, each on its own files; none commits. The simulation's `lead` reviews and merges; its `qa` checks.

| Agent | Tasks | Owns |
|---|---|---|
| `lr-ui` (shell) | `ThemeToggle` (exported from `src/components/index.js`, used as `<ThemeToggle v={v} />` like `LangToggle`, `v` optional): reads and sets `data-theme`, saves `prefs.theme`, updates `theme-color`. Placed by the language switch in the sidebar and in the account menu on phones. The CSS files and every component in the control-room look; the strings for the switch in English and Khmer; the README | `web/src/styles/` (not `tokens/` and `inline.js`), `web/src/components/`, `web/src/layout/`, `web/src/App.jsx`, `web/src/data/constants.js`, `web/src/i18n/`, `web/README.md` |
| `lr-ui` (screens) | Every screen in the look, the camera's always-dark overlay on `--c-on-dark`; `ThemeToggle` on the sign-in screen by `LangToggle` | `web/src/screens/` |
| `lr-ui` (sheets) | Every sheet and the colours the view models hand to screens and sheets (`bg:on?'var(--navy-900)':'#fff'` becomes `--c-selected-*` / `--c-field`) | `web/src/sheets/`, `web/src/state/` |

## Exit checklist

- [x] No hex colour or hue name left for a surface, text, border or state outside `tokens/` (a grep shows only deliberate exceptions, each commented).
- [x] `npm run lint` shows no new warnings; `npm run build` passes. (181 warnings against 179: three new "ThemeToggle is defined but never used", in `Sidebar.jsx`, `AuthScreen.jsx` and `RoleSheet.jsx`, and one gone from `TabBar.jsx`. All are false: the lint setup does not see components used in JSX, as with the warnings already there.)
- [x] Screenshots of Home, Reports, a report, the capture flow, Edit line info, Plan, Chat and sign-in, in both themes, on a phone and a computer, reviewed.
- [x] The switch keeps the choice after a reload; the app opens dark for someone who has not chosen.

## Status

Built on 30 and 31 October by three `lr-ui` agents in parallel (shell, screens, sheets), checked by the simulation's `qa`:

- Deliberate exceptions, each commented: the camera and the photo overlays stay dark in both themes; the signature pad stays white with a navy pen (the signature is stored as an image); the avatars' image colours; the `theme-color` meta values; severity "Low"'s neutral greys.
- `lead` added `--c-grid` (the faint backdrop grid, as in the simulation) and turned on the uppercase section labels in dark (`--lr-label-*`).
- Light keeps today's design, with a few shades one step off where no token matched exactly (dividers, idle tab text, progress tracks, the cleaning bar); the agents listed each.
- `qa`: a new person gets dark even when the OS asks for light; the choice survives a reload; 36 screenshots (nine screens × two themes × phone and computer) with no problem new to this phase.
- Open: the developer's own look on a phone and a computer.
