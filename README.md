# Sri Lanka Energy Balance dashboard concept

Interactive tender mockup for transaction 10055844. Open `dist/index.html` directly in a browser, or serve `dist` with a static HTTP server. No installation or build is required. The source is portable HTML, CSS and JavaScript.

All statistics are synthetic. No SLSEA Energy Balance workbooks, official branding assets or official ISIC mapping were supplied. The monogram is a concept mark. This is a frontend demonstration, not a completed tender deliverable or an official SLSEA service.

## Demonstration walkthrough

1. Open Overview. Change year, source, sector and energy unit. The final consumption flow, mix and trends update together. Try Petroleum + Transport, then Reset.
2. Switch the energy flow to Table. Sort consumption and hide the share column. Open Energy balance to compare years.
3. Search “Compare electricity in 2022 and 2024” or “grid emissions”. Search supports structured keyword patterns, not a connected AI service.
4. Explore Buildings & ISIC. Select a building type and inspect consumption and electricity EUI.
5. Select Data Provider in the role preview. Open Data submissions and create an electricity submission of 16,200 GWh. Values outside ±20% of that demo baseline trigger a plausibility message; drafts remain possible.
6. Select Verifier. Open Verification queue, review the new submission and approve it or request a revision with a comment. Inspect the audit trail.
7. Select Administrator to edit the demo emission factor and inspect the operations requirements.
8. Use Export data for CSV. Under Reports & exports, select content, preview the report and Print / Save as PDF. A browser pop-up may need to be allowed.

Role selection is UI simulation, not security. Drafts, decisions and parameters are kept only in memory and reset on reload. No data is transmitted to SLSEA or any other organisation.

## Document review and design traceability

All 11 supplied files were extracted into the adjacent `document-review` folder for review. Only the application source and this guide are included in the hosted mockup; original tender files are not uploaded.

| Supplied document | Relevance to this concept |
| --- | --- |
| 1. Application requirements for the award of contracts.docx | Administrative bid requirements; does not define dashboard widgets. Kept outside the portal. |
| 2. Self Declaration Form.docx | Bidder eligibility declaration; not an energy data submission form. Kept outside the portal. |
| 3. GTC updated 12.2024.pdf | Contract, confidentiality, rights and design context. Concept uses no actual personal or operational data. |
| 4.Invitation to Tender-10055844.pdf | Identifies the procurement and deliverable context. No bid is submitted by this mockup. |
| 5. ToR for Energy Balance Dashboard and Data Management Platform.pdf | Main scope, workflows, historical migration, analytics, reporting, security and operational handover requirements. Sections 2.3 and 3.2 guide the screens and interactive prototype. |
| 5.1 Annexure 1 to ToR - Specifications.pdf | Binding detailed scope. Sections 1–2 guide the eight analytical areas, Sankey, charts, tables, buildings and emissions. Sections 3–6 guide filtering, submissions, administration and calculation transparency. |
| 5.2 Annexure 2: Data protection standards | Privacy by design, minimisation, transparency, consent and data rights. No personal records or analytics tracking are used in this concept. |
| 5.3 Annexure 3: Information security requirements | Governance, access control, logging, backup and encryption requirements reflected as production controls in the admin screen. |
| 6. Price Schedule for Services - 10055844.xlsx | Milestone 3 identifies prototype and sample dashboards; milestones are not presented as energy metrics. No pricing is added. |
| 7. Eligibility Criteria for EBD Tender.pdf | Procurement eligibility; outside the portal interface. |
| 8. Technical evaluation Grid for IT service_EBD.pdf | Concept, methodology, testing/documentation and staff assessment context; mockup supports demonstrating the proposed user experience only. |

## What works and what remains

| Requirement | Mockup coverage | Production work |
| --- | --- | --- |
| Eight analytical areas | Energy balance, electricity, petroleum, coal, biomass, economic indicators, emissions, buildings | Complete every prescribed table/chart using the supplied official datasets |
| Sankey and mix | Proportional source-to-sector diagram, tooltips and circular mix chart | Full supply/transformation/loss balance and hierarchical sunburst |
| Filter/compare | Year, energy source, sector, units, year comparison, ISIC sample selector, category checkboxes | Geography, organisation, full historical archive, monthly/quarterly data |
| Tables and exports | Sorting, optional share column, CSV with metadata, printable report | XLSX preserving formatting, PNG/JPEG chart exports, server-generated PDF |
| Submission workflow | Synthetic records, online form, validation, draft, review, approval/revision/rejection, audit events | Authentication, organisation-scoped permissions, durable records, resubmission/version history, Excel bulk import |
| Natural-language queries | Structured keyword and year matching | Approved data-backed search coverage and future conversational extensions |
| Forecast | Optional one-year linear endpoint projection on Overview | Agreed, validated forecasting method and uncertainty disclosures |
| Calculations | Demonstration aggregation, renewable share, PJ/TJ/ktoe/GWh conversions, editable sample factor | SLSEA-approved engine, densities, exchange rates, source references, versioned approval |
| Security and privacy | No personal datasets; clear role-simulation label | MFA, RBAC, encryption at rest/in transit, logging, monitoring, penetration tests, retention, data rights |
| Hosting and handover | Portable static source; private demonstration hosting | SLSEA AWS deployment, database, backups and tested restoration, monitoring, manuals, training and O&M |
| Performance | Small buildless frontend | Verify mandatory 100 concurrent authenticated active users; dashboard max 5 seconds/target 3; standard reports max 10 seconds; at least 30 years online and 5 years audit retention |

## Data and calculation notes

The source-by-sector matrix has a 450 PJ illustrative total in 2024. Rows are petroleum (200), biomass (165), coal (35), hydro (35), solar and wind (15). Columns sum to transport (150), industry (181), households (100), commercial (19). Annual multipliers are 0.85, 0.90, 0.87, 0.94 and 1.00 for 2020–2024. They describe no real historical observations.

Energy conversions: 1 PJ = 1,000 TJ; 1 GWh = 0.0036 PJ; 1 ktoe = 0.041868 PJ. Currency and fuel mass/volume are not interchangeable with energy units. Those conversions require additional rates, dates, densities and assumptions.

The Overview projection extends the slope between the first and last synthetic annual observations by one year. The default sample combined margin is 0.520 tCO₂/MWh, calculated as equal weights of illustrative 0.710 operating margin and 0.330 build margin. Changing the demo parameter overrides that example and is logged.

Sector module tabs demonstrate navigation and category selection using sample values; the individual load profiles, financial accounts and capacity series are conceptual rather than validated statistical models. The building sample uses a fixed fuel allocation solely for layout demonstration. Official ISIC correspondence and all source formulas need stakeholder validation.

## Verification

JavaScript syntax checked with `node --check dist/app.js`. The included `verify.cjs` checks source/sector aggregation, conversion and rendering of the main role-specific routes without a browser. Browser visual and responsive QA could not be completed because the local browser preview timed out. No claim of tender compliance or production security is made.

## Component design update

The shared analytics layer is in `dist/components.js` and `dist/components.css`. Energy flows now use proportional gradient ribbons with keyboard focus and detail panels; source composition supports doughnut and pie modes. Sector modules support grouped columns and horizontal bars. Trends use an area fill and focusable data points. Building charts use segmented stacks. Tables share aligned numeric columns, source tokens, share meters, totals where applicable and consistent status chips. Forms, filters, tabs, notices and dialogs use the same component styles. Chart information is available through pointer hover and keyboard focus, with native titles retained on key SVG marks.
