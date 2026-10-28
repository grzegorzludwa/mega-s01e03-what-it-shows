# Shared date parser reads month first for day-first tenants — 379 reports

Cause: `parser`. **379 unique reports** from ticket #4471 in the support kb export dated 2026-10-04.

The shared parser reads every date month first, while these tenants use day-first dates.
For example, R-41200 reports 7 April becoming 4 July for Harbour Dental (`en-GB`, `booking-v2`, app).
App and email reports are in this group; form reports from day-first `booking-v2` tenants are also included.

Expected: parse the date according to the tenant's date convention. Actual behavior described
in the reports: day and month are swapped, or a booking appears on the wrong date.

Verification scenario: in a day-first tenant, enter 07/04/2026 through the affected shared-parser
path and verify 7 April, then check a day greater than twelve and a month-first tenant as controls.
The export contains no runnable product, so this scenario has not been executed against production.

Scope: 11 tenants; received 2026-04-01 through 2026-10-04; channels: 204 app, 150 email, 25 form.
Count each report ID once. Export pagination overlaps contribute repeated rows, not new reports.
The supplied `causeOf` rule and tenant directory determine membership, rather than subject or intake tag.
Intake called 356 of these reports parser and 23 hint.

The five desk-noted one-day descriptions (R-41202, R-41209, R-41236, R-41344, R-41620)
remain included in these 379 according to the supplied rules. Investigate them without adding
another count or asserting a separate timezone defect from the text alone.

Keep this separate from the 33-report `hint` issue: correcting the parser does not correct the
`booking-v3` field hint. Original #4471 is a source-desk ticket, not an issue number in this repository.

Evidence: `evidence/report-groups.json` (all member IDs), `src/lib/kb/causes.ts`,
`src/lib/data/tenants/`, and `src/lib/data/reports-4471.json`.
Signed review: `src/routes/kb/incidents/4471-review/+page.svx` and its rendered HTML under `rendered/`.
