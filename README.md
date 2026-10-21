# SLSEA Energy Intelligence - Next.js

An interactive Energy Balance dashboard concept based on tender 10055844. This is a React/Next.js rebuild of the earlier static mockup. All statistics are synthetic; all role-based workflows are demonstrations.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open the URL printed by Next.js. Hash navigation preserves the original prototype links, including /#overview, /#balance, /#buildings, /#submissions, /#review and /#admin.

```sh
npm run typecheck
npm test
npm run build
```

Next.js static export writes the deployable app to out/. Serve that folder with a static HTTP server. The private Site deploys out/. After building, npm start serves the export on http://127.0.0.1:3000 using the included static preview server. Production SLSEA AWS infrastructure and backend services remain outside this mockup.

## Stack

| Library | Actual use |
| --- | --- |
| Next.js App Router, React, TypeScript | Application, prerendering, bundling, typed domain model |
| Tailwind CSS v4 | Theme tokens, responsive layouts and component utilities |
| shadcn/ui + Radix UI | Accessible selects, dialogs, tabs, sheets, menus, tooltips, buttons, inputs and tables; editable source in components/ui |
| Motion | Page transitions, shared sidebar highlight, spring metric counters, animated flow ribbons and bar widths; reduced-motion preference respected |
| Recharts | Area trends, grouped columns, stacked building charts, pie/doughnut views, responsive containers and hover details |
| TanStack Table v8 | Category search, sorting, column visibility, pagination and filtered totals |
| React Hook Form + Zod | Typed submission capture and numeric/required-field validation |
| Sonner | Success and error notifications |
| Lucide React | Consistent vector icons |
| next-themes | Light/dark themes |
| date-fns | Report date formatting |
| Prettier | Consistent source formatting |

The lockfile records resolved package versions. Only libraries used by this application are installed.

## Source map

- app/: Next.js entry points and theme styles.
- components/dashboard.tsx: 13 screens, filters, search, reports and demonstration workflows.
- components/energy-charts.tsx: React charts and animated energy-flow SVG.
- components/energy-table.tsx: TanStack and shadcn data table.
- components/ui/: editable shadcn/ui component source.
- lib/energy.ts: source/sector matrix, conversions, sample datasets, workflow rules and CSV metadata.
- lib/energy.test.ts: reconciliation, unit-conversion, review guards and export-provenance checks.
- docs/tender-requirements.md: review and mapping of all 11 supplied documents, plus production gaps.
- legacy-static/: preserved original prototype; not deployed.

## Walkthrough

1. Change year, source, sector and unit on Overview. Flow, mix, trends and sector consumption reconcile from the same matrix.
2. Switch pie/doughnut and columns/bars; toggle the trend projection; select generation categories.
3. Open Energy balance. Compare years, search/sort the table, hide columns and page results.
4. Search 'Compare electricity in 2022 and 2024' or 'building energy'. Search uses structured patterns, not an external AI service.
5. Explore ISIC building consumption and EUI, and grid emissions.
6. Preview Data Provider. Submit the default 16,200 GWh electricity example, or try a value outside the 20% historical tolerance to trigger a plausibility message. Save or edit a draft.
7. Preview Verifier. Approve, reject or request a revision with a comment. Preview Data Provider to revise a CEB draft or returned record. Versions increase and decisions appear in the audit trail.
8. Preview Administrator. Edit the sample emissions coefficient and inspect the planned operations/security controls.
9. Choose report sections, preview the report, then Print / Save as PDF. CSV downloads include unit, period, filters and source metadata.
10. Toggle light/dark mode. Motion respects the device's reduced-motion setting.

Drafts, decisions, audit events and the sample coefficient persist in this tab's sessionStorage and reset when the session is cleared. Role selection is UI simulation, not authentication. No actual institutional submissions or personal records are used. CSV download is functional. Excel ingestion, native XLSX/chart-image exports and server reports remain production tasks.

## Data and production limits

The 2024 matrix totals 450 PJ: petroleum 200, biomass 165, coal 35, hydro 35, solar/wind 15. Annual multipliers illustrate 2020-2024 and are not official observations. 1 PJ = 1,000 TJ; 1 GWh = 0.0036 PJ; 1 ktoe = 0.041868 PJ. Emission factors and building benchmarks are synthetic. Official methodologies, datasets and ISIC mapping require SLSEA validation.

Production authentication/MFA/RBAC, durable data storage, secure Excel uploads, approval-controlled calculations, backups, privacy/data-rights services, monitoring and integrations are not implemented. Performance, concurrency and security compliance must be tested against a real backend; no such compliance is claimed.

Original tender files are not included in the deployed app. The complete original review is retained in docs/tender-requirements.md.

## Verification performed

- Next.js production static export and strict TypeScript check passed.
- Five domain tests passed: source/sector reconciliation, baseline and empty intersections, conversions, review guards, and CSV provenance.
- Desktop browser checks covered light/dark rendering, independent pie/table controls, searched table totals, numeric plausibility feedback, submission, approval, and audit events.
- Mobile review at a 390px viewport confirmed the navigation sheet and contained chart/table layouts without page-width overflow.
- No warnings or errors were captured during the browser checks.
