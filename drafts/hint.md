# Booking-v3 shows a month-first hint while reading day first — 33 reports

Cause: `hint`. **33 unique reports** from ticket #4471 in the support kb export dated 2026-10-04.

The `booking-v3` form prints `MM/DD/YYYY`, while the affected tenant's form reads dates in
day-first order. A person following the hint can therefore book a different date.
This affects form-channel reports from Alder Physio (`de-DE`), Copper Studio (`es-ES`),
and Pale Harbour (`pt-PT`). For example, R-41241 reports a 6 August booking appearing on 8 June.

Expected: the field hint and the form's interpretation agree with the tenant's date convention.
Actual behavior described by the supplied rules: the hint requests month/day, but the form
interprets day/month. Correct the hint for the tenant and verify dates entered as instructed.

Verification scenario: in the Alder Physio `booking-v3` form, follow its MM/DD/YYYY hint to enter
08/06/2026 for 6 August, and check the date stored and displayed. Compare the same tenant's
app channel and a `booking-v2` tenant. No runnable product was supplied, so this is an unexecuted
product verification scenario; the classification was checked using the export's executable rules.

Scope: 3 tenants; all 33 are form reports; received 2026-04-17 through 2026-09-22.
Count each report ID once. Use tenant locale and form version, not the reporter's browser locale.
Intake called 18 of these reports hint and 15 parser; those tags are guesses, not membership rules.

Keep this separate from the 379-report `parser` issue. A parser fix alone leaves the misleading
field hint in place. Original #4471 is a source-desk ticket, not an issue number in this repository.

Evidence: `evidence/report-groups.json` (all member IDs), `src/lib/kb/causes.ts`,
`src/lib/data/tenants/`, and `src/lib/data/reports-4471.json`.
Signed review: `src/routes/kb/incidents/4471-review/+page.svx` and its rendered HTML under `rendered/`.
