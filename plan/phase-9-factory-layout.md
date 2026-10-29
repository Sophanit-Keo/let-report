# Phase 9 · The factory layout, for the simulation's Factory board

Let Report keeps the factory's layout: which UHT plant feeds each production line, the line's filler, its speed and its pack size, and the list of UHT plants with their capacity. The UHT milk plant simulation reads it, with each line's status, product, lot and CIP, for its live **Factory board** ([its card](https://github.com/Sophanit-Keo/simulation-milk-process/blob/master/plan/agent-plan/phase-9-factory-board.md)). Change a line in Let Report and the board follows within a second, over the realtime feed the app already uses.

## The factory

| UHT | Capacity | Lines | Filler | Speed | Pack |
|---|---|---|---|---|---|
| UHT 1 | 4,000 L/h | UHT line 1 | TFA | 3,600 packs/h | 100 ml |
| | | UHT line 6 | TBA/22 | 20,000 packs/h | 100 ml |
| UHT 2 | 8,000 L/h | UHT line 2 | TBA/19 | 7,500 packs/h | 100 ml |
| | | UHT line 3, 4 | A3/Speed | 24,000 packs/h | 100 ml |
| UHT 3 | 4,000 L/h | UHT line 7 | A3/Speed | 24,000 packs/h | 100 ml |

The speeds are Tetra Pak's published ratings and the pack size a starting value; people correct them in **Edit line info**. There is no line 5.

## Contract

**Database (migration 0013, additive):**

| Table | Column | Type | Meaning |
|---|---|---|---|
| `production_lines` | `uht` | `text not null default ''` | The UHT that feeds the line, a name from `uht_units`; '' for none |
| | `filler` | `text not null default ''` | The filler model: `TFA`, `TBA/19`, `TBA/22`, `A3/Speed` or another; '' for none |
| | `filler_packs_per_h` | `integer`, `> 0` or null | The filler's speed |
| | `pack_ml` | `integer`, `> 0` or null | The pack size |
| `factory_settings` | `uht_units` | `jsonb not null default '[]'`, an array | `[{ "name": "UHT 1", "capacityLph": 4000 }, …]` |

The migration fills in the table above once: `uht_units` if it is empty, and each `UHT line N` whose `uht` is still ''. The policies and the realtime publication stay as they are: both tables are already in it.

**App:** `line.uht`, `line.filler`, `line.packsPerH`, `line.packMl` (`src/api/repo.js`, `rowToLine`/`lineToRow`), and `plan.uhtUnits` (`rowToPlan`/`planToRow`). Against a database without migration 0013 the app still runs: `withoutMissing()` leaves out the columns it lacks.

## Who does what

The agents' definitions are in `.claude/agents/`. The simulation's `lead` runs them, reviews and merges, and applies the migration.

| Agent | Tasks | Owns |
|---|---|---|
| `lr-data` | Migration 0013 with its starting data; the new fields in `repo.js`; check the plan's change-log trigger (0011) still logs plan edits | `web/supabase/migrations/0013_factory_layout.sql`, `web/src/api/repo.js` |
| `lr-ui` | `FILLERS` with their default speeds. **Edit line info**: UHT pills from the plan's list, plus None; filler pills, plus other text; speed and pack size; the L/h they make. **Plan**: the UHT list, with name and L/h, add and remove (supervisors and the manager). A "UHT 1 · TBA/22" line on the line card and the line sheet. English and Khmer text. The README | `web/src/data/constants.js`, `web/src/sheets/LineFormSheet.jsx`, `web/src/sheets/PlanSheet.jsx`, the line card and line sheet, the line and plan form code in `web/src/state/AppController.js` and `viewModel.js`, `web/src/i18n/en.js`, `km.js`, `web/README.md` |

## Exit checklist

- [ ] `npm run lint` shows no new warnings; `npm run build` passes.
- [ ] Against a fake backend in a browser: edit a line's UHT, filler, speed and pack size, and the UHT list; the saved rows carry them; a database without the columns still saves the rest.
- [ ] Migration 0013 applied; the new columns and the UHT list read back from the database.
- [ ] Changing a line in Let Report shows on the simulation's Factory board within a second.
