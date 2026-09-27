-- Every signed-in staff member (QC, QA, supervisor, manager) can add production lines.
-- Removing a line stays manager-only.
drop policy "lines: manager add" on public.production_lines;
create policy "lines: staff add" on public.production_lines for insert to authenticated with check (true);
