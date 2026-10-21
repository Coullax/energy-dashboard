export type Unit = "PJ" | "GWh" | "TJ" | "ktoe";
export type Role = "Viewer" | "Data Provider" | "Verifier" | "Administrator";
export type Filters = {
  year: string;
  source: string;
  sector: string;
  unit: Unit;
};
export type Datum = {
  name: string;
  value: number;
  color: string;
  previous?: number;
};
export const palette = ["#388568", "#9dc77c", "#cadc98", "#efbb7b", "#7eacb9"];
export const sources = [
  "Petroleum",
  "Biomass",
  "Coal",
  "Hydro",
  "Solar & wind",
];
export const sectors = ["Transport", "Industry", "Households", "Commercial"];
export const matrix = [
  [150, 35, 10, 5],
  [0, 85, 75, 5],
  [0, 35, 0, 0],
  [0, 18, 10, 7],
  [0, 8, 5, 2],
];
export const years = ["2024", "2023", "2022", "2021", "2020"];
export const yearFactor: Record<string, number> = {
  2024: 1,
  2023: 0.94,
  2022: 0.87,
  2021: 0.9,
  2020: 0.85,
};
export const conversions: Record<Unit, number> = {
  PJ: 1,
  GWh: 1 / 0.0036,
  TJ: 1000,
  ktoe: 1 / 0.041868,
};
export const initialFilters: Filters = {
  year: "2024",
  source: "All sources",
  sector: "All sectors",
  unit: "PJ",
};
export const format = (value: number, digits = 1) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
export function cells(f: Filters) {
  return matrix.map((row, i) =>
    row.map((v, j) =>
      (f.source === "All sources" || sources[i] === f.source) &&
      (f.sector === "All sectors" || sectors[j] === f.sector)
        ? v * (yearFactor[f.year] || 1)
        : 0,
    ),
  );
}
export function total(f: Filters) {
  return cells(f)
    .flat()
    .reduce((s, v) => s + v, 0);
}
export function sourceData(f: Filters): Datum[] {
  return cells(f)
    .map((row, i) => ({
      name: sources[i],
      value: row.reduce((a, b) => a + b, 0),
      color: palette[i],
    }))
    .filter((r) => f.source === "All sources" || r.name === f.source);
}
export function sectorData(f: Filters): Datum[] {
  const m = cells(f);
  return sectors
    .map((name, j) => ({
      name,
      value: m.reduce((s, r) => s + r[j], 0),
      color: palette[j],
    }))
    .filter((r) => f.sector === "All sectors" || r.name === f.sector);
}
export function energy(v: number, u: Unit) {
  return format(v * conversions[u]);
}
export const moduleConfigs: Record<
  string,
  {
    title: string;
    description: string;
    items: string[];
    values: number[];
    tabs: string[];
  }
> = {
  electricity: {
    title: "Electricity",
    description: "Generation, capacity and demand across the national grid.",
    items: [
      "Major hydro",
      "CEB thermal (coal)",
      "CEB thermal (oil)",
      "SPP solar",
      "SPP wind",
      "SPP biomass",
    ],
    values: [6000, 5800, 2100, 1500, 600, 200],
    tabs: ["Generation", "Capacity", "Load profile", "Sales"],
  },
  petroleum: {
    title: "Petroleum",
    description: "Explore fuel imports, refinery outputs and product sales.",
    items: ["Diesel", "Petrol", "Furnace oil", "Kerosene", "LPG"],
    values: [94, 52, 24, 16, 14],
    tabs: ["Imports", "Refinery products", "Product sales", "Prices & finance"],
  },
  coal: {
    title: "Coal",
    description: "Track the role of coal in power generation and industry.",
    items: ["Power generation", "Industry"],
    values: [28, 7],
    tabs: ["Imports", "Consumption"],
  },
  biomass: {
    title: "Biomass",
    description:
      "Understand the contribution of fuelwood, charcoal and biogas.",
    items: ["Household fuelwood", "Industrial fuelwood", "Charcoal", "Biogas"],
    values: [75, 70, 15, 5],
    tabs: ["Fuelwood", "Charcoal & biogas"],
  },
  economic: {
    title: "Economic indicators",
    description:
      "Connect energy consumption with economic and social activity.",
    items: ["Industry", "Transport", "Residential", "Services"],
    values: [181, 150, 100, 19],
    tabs: ["Energy indicators", "Energy & GDP", "Trade balance", "Population"],
  },
};
export const buildings = [
  { name: "Manufacturing", code: "C · ISIC 10–33", value: 12, eui: 82 },
  { name: "Wholesale & retail", code: "G · ISIC 45–47", value: 8, eui: 118 },
  { name: "Accommodation", code: "I · ISIC 55", value: 9, eui: 155 },
  { name: "Health services", code: "Q · ISIC 86", value: 7, eui: 142 },
  { name: "Education", code: "P · ISIC 85", value: 5, eui: 64 },
];
export type Submission = {
  id: string;
  org: string;
  dataset: string;
  period: string;
  value: number;
  unit: string;
  status:
    | "Draft"
    | "Awaiting review"
    | "Approved"
    | "Revision requested"
    | "Rejected";
  version: number;
};
export const demoSubmissions: Submission[] = [
  {
    id: "SUB-024",
    org: "CEB",
    dataset: "Electricity generation",
    period: "2024 · Annual",
    value: 16200,
    unit: "GWh",
    status: "Awaiting review",
    version: 1,
  },
  {
    id: "SUB-023",
    org: "CPC",
    dataset: "Petroleum imports",
    period: "2024 · Annual",
    value: 200,
    unit: "PJ",
    status: "Revision requested",
    version: 2,
  },
  {
    id: "SUB-022",
    org: "SLSEA",
    dataset: "Building energy",
    period: "2024 · Annual",
    value: 58,
    unit: "GWh",
    status: "Approved",
    version: 1,
  },
  {
    id: "SUB-021",
    org: "Litro Gas",
    dataset: "LPG sales",
    period: "2024 · Annual",
    value: 14,
    unit: "PJ",
    status: "Approved",
    version: 1,
  },
];
export function canReview(role: Role) {
  return role === "Verifier" || role === "Administrator";
}
export function canSubmit(role: Role) {
  return role === "Data Provider" || role === "Administrator";
}
export function reviewRecord(
  s: Submission,
  decision: Submission["status"],
  comment: string,
  role: Role,
): Submission {
  if (!canReview(role))
    throw new Error("Choose a verifier or administrator role.");
  if (s.status !== "Awaiting review")
    throw new Error("Only pending submissions can be reviewed.");
  if (!["Approved", "Revision requested", "Rejected"].includes(decision))
    throw new Error("Invalid review decision.");
  if (decision !== "Approved" && !comment.trim())
    throw new Error("Add a review comment.");
  return { ...s, status: decision };
}
export function csv(rows: Datum[], f: Filters, u: string = f.unit) {
  const lines = [
    ["Source", "Synthetic demonstration data; not official SLSEA statistics"],
    ["Reporting year", f.year],
    ["Unit", u],
    ["Source filter", f.source],
    ["Sector filter", f.sector],
    ["Generated", new Date().toISOString()],
    ["Category", "Value"],
    ...rows.map((r) => [r.name, r.value]),
  ];
  return lines
    .map((row) =>
      row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","),
    )
    .join("\r\n");
}
