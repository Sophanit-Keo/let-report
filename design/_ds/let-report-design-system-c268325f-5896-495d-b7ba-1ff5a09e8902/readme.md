# Let Report Design System

Visual language for **Let Report**, a QA management system for food businesses, and its educational social content published under the **Standard AI Copilot** ("SAI") brand — tagline *"Your Partner for Safer Food"*. The main output is a 30-day series of food-safety training posts (quizzes, definitions, comparisons) for owners, managers and food handlers who aren't experts.

Mood: professional food-safety training that is easy and friendly. Navy builds trust, green means safety, and blue invites people to learn.

The full A–T specification is in **`guidelines/design-system-spec.md`**.

## Sources
All sources were uploaded images. Originals are in `uploads/`, and copies are in `assets/`:
- `assets/reference/day6-document-or-record.jpg`: the reference post ("Day 6 · Document or Record?") and the source of truth for the visual direction.
- `assets/logo-badge.jpg`: circular SAI seal (shield, clipboard, leaf, circuit lines).
- `assets/characters/sheets/{vina,sokha,dara}-sheet.png`: character reference sheets. They set the palette as #0F2D58 / #2686E6 / #38B573 / #F5F7FA / #FFFFFF.

No codebase, Figma file or product UI was provided. **The user gave the product name "Let Report", but every visual asset carries "Standard AI Copilot".** There is no Let Report logo, so the `LogoLockup` "wordmark" variant sets it in plain type.

## Index
- `styles.css`: the entry point, made only of `@import` lines → `tokens/{fonts,colors,typography,spacing,effects,base}.css`
- `guidelines/`: 18 foundation cards (colors, type, spacing, grid, radius, shadows, brand) plus `design-system-spec.md`
- `components/`: React primitives (below), each with `.jsx`, `.d.ts`, `.prompt.md` and a card in its folder
- `ui_kits/social-posts/`: interactive example post (portrait, square, landscape; quiz and answers)
- `templates/quiz-post/QuizPost.dc.html`: editable 1080×1350 quiz-post template
- `assets/`: logos, character crops (`characters/*-full.png`, `*-portrait.png`), reference sheets
- `SKILL.md`: agent-skill entry point

## Components
- **brand/**: LogoLockup, BrandHeader, DayBadge, HeroHeadline, TermHighlight, HeroCharacter
- **content/**: SectionHeader, EduCard (default/question/answer/example/warning/success/educational), NumberBadge, Badge, Callout (tip/warning/correct), ProgressIndicator, Icon
- **quiz/**: QuizCard, DocumentIllustration, RecordIllustration
- **actions/**: Button (primary/success/secondary/navy; states hover/active/disabled/correct/incorrect)
- **cta/**: CTABanner, BenefitFooter

These map to the 20 components in the brief. Tip Box, Warning Box and Correct Answer Box are one component, `Callout`. Primary and Success Button are both `Button`.
Intentional additions: `TermHighlight`, the inline blue/green chip for the terms being compared (seen in the reference), and `Badge`, which covers the topic, category and correct-answer badges.

All sizes are at **master canvas scale** (1080 px wide). For app or web UI, multiply type by `--type-ui-scale` (0.55).

## Content fundamentals
- **Voice:** a friendly trainer talking to one person. Use "you", "let's" and "together". The host character speaks in the first person ("Can you spot…?").
- **Casing:** sentence case for headlines ("Clean or sanitized?"). Title Case only for short benefit phrases and card titles copied from real documents ("Equipment Cleaning Log"). Never set whole lines in ALL CAPS. The day badge reads "Day 6", not "DAY 6".
- **Plain words:** "tells people what to do", not "defines procedural requirements". "Proves what was done", not "provides objective evidence".
- **Shape:** a question headline (≤ 5 words), a two-line definition that uses the colour-coded terms, 4–6 concrete workplace examples, then one imperative CTA ("Comment your answers below!") with a warm follow-up line ("Let's learn together with Vina!").
- **Punctuation:** exclamation marks are fine in the subtitle and CTA, at most one per line. Headlines end in "?".
- **Emoji:** never. Unicode ✓ appears only as a tick inside record tables.
- **Standards names** (HACCP, GMP, GHP) appear as badges or background props, not in body copy without explanation.

## Visual foundations
- **Colour:** navy #0F2D58 for headings, text and CTA. Green #38B573 for positives and records; use green-600 #1E8449 wherever white text sits on green. Blue #2686E6 / #1F74D0 for questions and "term A". Backgrounds are pale blue #F2F8FE → white, with pale green used rarely. Colour carries meaning: blue = first option or question, green = second option or correct.
- **Type:** Plus Jakarta Sans 800 for headlines with tight tracking (−0.02em), and 500 for body. Caveat is used only for handwritten character quotes.
- **Backgrounds:** a soft sky gradient (#EAF4FD → #F7FBFF) with one or two very faint radial colour glows. Optionally a blurred kitchen or office photo at low contrast behind the header. Keep 80–90% quiet space. No patterns, textures or grain.
- **Layout:** fixed zones on a 1080×1350 portrait: brand row, then hero (25–32%), then a content panel of rounded cards, then a navy pill CTA, then a full-bleed white benefit footer with a green angled "Follow" panel. Margins are 44 px on a 12-column grid.
- **Cards:** radius 20, a 1.5 px pale-blue border (#C4DFFA), and a pale-blue top-to-bottom gradient or white fill. Shadow is either none or `--shadow-card` (very soft, navy-tinted). Never use a coloured left border.
- **Corners:** 6–12 on small items, 20–28 on cards and panels, pill for the CTA and badges. Number badges are full circles.
- **Shadows:** navy-tinted and low opacity (≤ 0.14). Buttons get a 3 px bottom "lip" (`--shadow-button`) that makes them feel tactile without gloss.
- **Hover / press:** hover darkens one step (blue-600 → 700). Press moves the button down 2 px and shrinks the lip. Disabled is gray-100 with gray-500 text. Correct is green with a 4 px green-300 ring and a check. Incorrect is pale red with a red border and an ×.
- **Motion** (digital only): 120–200 ms with `cubic-bezier(.2,.7,.2,1)`. Fades and short slides only. No bounce or parallax.
- **Transparency / blur:** only the content panel is slightly translucent (92%) over the backdrop. No glassmorphism.
- **Imagery:** bright, cool-neutral daylight, white and stainless kitchens and offices, soft focus. Illustrations are clean anime-style with cel shading.
- **Depth:** the backdrop sits behind the translucent panel, which sits behind white cards, with the character in the foreground. Keep it to three layers at most.

## Iconography
- **Lucide** (rounded caps and joins, 2 px stroke), loaded from CDN `lucide-static@0.460.0` and tinted with a CSS mask through the `Icon` component. **This is a substitution:** the reference uses filled glyphs (shield, people, bars, leaf) that aren't available as files. Brand aliases: document→file-text, record→clipboard-check, cleaning→spray-can, temperature→thermometer, hygiene→hand, training→graduation-cap, supplier→truck, equipment→wrench, food-safety→shield-check, checklist→list-checks, warning→triangle-alert, correct→circle-check.
- Icons are always a single colour (navy, blue-600, green-600 or amber-700). In the CTA they sit on a white circle. In quiz tiles they sit on a white rounded square.
- Document and record visuals are built from components (`DocumentIllustration`, `RecordIllustration`), not icons.
- No emoji and no icon fonts.
