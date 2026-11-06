import dataset from "./energy-tree-data.json";
import { conversions, yearFactor, type Filters } from "./energy";

export type EnergyRecord = (typeof dataset.records)[number];
export type District = (typeof dataset.districts)[number];
export type Dimension =
  "source" | "sector" | "province" | "district" | "endpointId";
export type TreeMode = "sources" | "users";
export const districts: District[] = dataset.districts;
export const treeLevels: Record<TreeMode, Dimension[]> = {
  sources: ["source", "sector", "province", "district", "endpointId"],
  users: ["province", "district", "sector", "source", "endpointId"],
};
export const dimensionLabel: Record<Dimension, string> = {
  source: "Energy source",
  sector: "User sector",
  province: "Province",
  district: "District",
  endpointId: "Household, meter or site",
};
export const allRecords: EnergyRecord[] = dataset.records;
export const sumRecords = (rows: EnergyRecord[]) =>
  rows.reduce((s, r) => s + r.pj, 0);
export const share = (value: number, denominator: number) =>
  denominator > 0 ? (value / denominator) * 100 : 0;
export function filterRecords(f: Filters) {
  return allRecords
    .filter(
      (r) =>
        (f.source === "All sources" || f.source === r.source) &&
        (f.sector === "All sectors" || f.sector === r.sector),
    )
    .map((r) => ({
      ...r,
      year: Number(f.year),
      pj: r.pj * (yearFactor[f.year] ?? 1),
    }));
}
export function branchRecords(
  rows: EnergyRecord[],
  mode: TreeMode,
  path: string[],
) {
  return rows.filter((r) =>
    path.every((name, i) => String(r[treeLevels[mode][i]]) === name),
  );
}
export function grouped(rows: EnergyRecord[], dimension: Dimension) {
  const groups = new Map<string, EnergyRecord[]>();
  for (const row of rows) {
    const k = String(row[dimension]);
    groups.set(k, [...(groups.get(k) ?? []), row]);
  }
  return [...groups]
    .map(([name, records]) => ({ name, records, value: sumRecords(records) }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}
export function districtMetrics(rows: EnergyRecord[]) {
  const total = sumRecords(rows);
  return districts
    .map((d) => {
      const records = rows.filter((r) => r.districtId === d.id);
      const value = sumRecords(records);
      const renewable = records.filter((r) =>
        ["Biomass", "Hydro", "Solar & wind"].includes(r.source),
      );
      return {
        ...d,
        value,
        share: share(value, total),
        renewableShare: share(sumRecords(renewable), value),
        endpoints: new Set(records.map((r) => r.endpointId)).size,
        records,
      };
    })
    .sort((a, b) => b.value - a.value);
}
export function recordCSV(rows: EnergyRecord[], f: Filters) {
  const q = (s: unknown) => '"' + String(s).replaceAll('"', '""') + '"';
  return [
    ["Data status", "Synthetic demonstration; no real personal records"],
    ["Reporting year", f.year],
    ["Value unit", f.unit],
    ["Source filter", f.source],
    ["Sector filter", f.sector],
    [
      "Observation ID",
      "Source",
      "Sector",
      "Province",
      "District",
      "Endpoint ID",
      "Endpoint type",
      `Energy (${f.unit})`,
      "Capture method",
    ],
    ...rows.map((r) => [
      r.id,
      r.source,
      r.sector,
      r.province,
      r.district,
      r.endpointId,
      r.endpointType,
      r.pj * conversions[f.unit],
      r.inputMethod,
    ]),
  ]
    .map((r) => r.map(q).join(","))
    .join("\r\n");
}
