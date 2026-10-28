# Review of source-desk ticket #4471

The supplied classifier separates 412 unique reports into 379 parser reports and 33 booking-hint
reports. The export has 427 rows because 15 report IDs occur twice; those duplicates are identical.

The signed follow-up is [the new incident page](src/routes/kb/incidents/4471-review/+page.svx).
The GitHub issue drafts are [parser](drafts/parser.md) and [hint](drafts/hint.md).
The [rendered review](rendered/kb/incidents/4471-review/index.html) and
[browser screenshot](evidence/4471-review.png) show the page as the desk sees it.
[Report membership evidence](evidence/report-groups.json) records every ID behind those counts.

All original export files remain unchanged, including the accepted decision. The follow-up explains
why the original page's one-issue conclusion and subject-only deduplication are unreliable, and
uses the supplied components to calculate counts, dates, and the signature reference at render time.
The five desk-noted one-day reports remain inside the parser count; their wording alone does not
establish an additional defect.

The analysis uses the supplied executable desk rules. No running product was supplied, so the
ticket reproduction scenarios are proposed checks rather than verified production reproductions.

## Reproduce the analysis and render

Requires Node.js 22 with type stripping. The student approved installation of the local npm
dependencies: Svelte 5.57.3, MDsveX 0.12.8, Vite 6.4.5, and the Svelte Vite plugin 5.1.1.
The lockfile records the full dependency tree; `npm ci` restores it.

```sh
npm run analyze
npm run render
npm run verify
```

The renderer compiles the actual `.svx` files and original Svelte components using MDsveX and Vite.
It writes self-contained HTML with server-rendered styles under `rendered/kb/`.
These are static render snapshots; re-render after changing the reports, tenant directory, or rules.
The added timeline wrapper derives its date range from report receipt and merge dates, so new
reports beyond the export's original chart window remain visible.

## Validation

- The actual MDsveX/Svelte build rendered all five pages successfully.
- The browser displayed parser 379 and hint 33, the one-day-note count 5, and signature reference
  `DR-BCHR-MV8H`. No missing images or horizontal overflow were observed.
- Isolated temporary-data checks passed: duplicate rows do not increase counts; a new report
  increases its cause count; a later report extends the timeline; a new tenant is discovered;
  a changed signature changes the rendered reference. The main source files were not mutated.
- Every original ZIP member remains byte-for-byte unchanged.

See [verification results](evidence/verification.json), [render summary](evidence/render-summary.json),
and [browser observations](evidence/browser-review.json).

The original ZIP has SHA-256
`267efc5ea61aca6efaaca842160ac4d0377d56bcbf5123e61c604d6ae99597f2`.

## Published

- The student approved creating `grzegorzludwa/mega-s01e03-what-it-shows` as a public GitHub
  repository, pushing the kb source, rendered pages, and evidence, and creating the drafted issues.
- Repository: [mega-s01e03-what-it-shows](https://github.com/grzegorzludwa/mega-s01e03-what-it-shows).
- [Parser issue 1](https://github.com/grzegorzludwa/mega-s01e03-what-it-shows/issues/1): 379 reports.
- [Booking-hint issue 2](https://github.com/grzegorzludwa/mega-s01e03-what-it-shows/issues/2): 33 reports.

## Pending

- Course submission, acceptance, and debrief.
