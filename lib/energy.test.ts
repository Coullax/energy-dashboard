import test from "node:test";
import assert from "node:assert/strict";
import {
  total,
  sourceData,
  sectorData,
  initialFilters,
  conversions,
  reviewRecord,
  demoSubmissions,
  csv,
} from "./energy";
test("source and sector totals reconcile across all years and filters", () => {
  for (const year of ["2020", "2021", "2022", "2023", "2024"])
    for (const source of ["All sources", "Petroleum", "Hydro"])
      for (const sector of ["All sectors", "Transport", "Industry"]) {
        const f = { ...initialFilters, year, source, sector };
        assert(
          Math.abs(sourceData(f).reduce((s, r) => s + r.value, 0) - total(f)) <
            1e-9,
        );
        assert(
          Math.abs(sectorData(f).reduce((s, r) => s + r.value, 0) - total(f)) <
            1e-9,
        );
      }
});
test("demo baseline and genuinely empty source-sector intersection", () => {
  assert.equal(total(initialFilters), 450);
  assert.equal(
    total({ ...initialFilters, source: "Petroleum", sector: "Transport" }),
    150,
  );
  assert.equal(
    total({ ...initialFilters, source: "Hydro", sector: "Transport" }),
    0,
  );
});
test("energy conversion round-trips and physical equivalences", () => {
  assert(Math.abs(conversions.GWh * 3.6 - 1000) < 1e-8);
  assert(Math.abs(conversions.ktoe * 0.041868 - 1) < 1e-8);
  for (const factor of Object.values(conversions))
    assert(Math.abs((450 * factor) / factor - 450) < 1e-8);
});
test("review requires role, pending record and correction reason", () => {
  const record = demoSubmissions[0];
  assert.throws(() => reviewRecord(record, "Approved", "", "Viewer"));
  assert.throws(() => reviewRecord(record, "Rejected", "", "Verifier"));
  assert.throws(() =>
    reviewRecord(demoSubmissions[2], "Approved", "", "Verifier"),
  );
  assert.equal(
    reviewRecord(
      record,
      "Revision requested",
      "Check source workbook",
      "Verifier",
    ).status,
    "Revision requested",
  );
  assert.equal(record.status, "Awaiting review");
});
test("CSV retains units, provenance and filter metadata", () => {
  const text = csv(sourceData(initialFilters), initialFilters);
  assert(text.includes("Synthetic demonstration"));
  assert(text.includes('"Unit","PJ"'));
  assert(text.includes('"Petroleum","200"'));
});
