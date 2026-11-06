import test from "node:test";
import assert from "node:assert/strict";
import { initialFilters, total, years, sources, sectors } from "./energy";
import {
  allRecords,
  filterRecords,
  grouped,
  treeLevels,
  branchRecords,
  sumRecords,
  districtMetrics,
  share,
} from "./energy-tree";
test("end-use records reconcile to existing matrix for all year/source/sector combinations", () => {
  for (const year of years)
    for (const source of ["All sources", ...sources])
      for (const sector of ["All sectors", ...sectors]) {
        const f = { ...initialFilters, year, source, sector };
        assert(Math.abs(sumRecords(filterRecords(f)) - total(f)) < 1e-8);
      }
});
test("every hierarchy branch conserves its parent total and sibling percentages", () => {
  for (const mode of ["sources", "users"] as const) {
    const check = (path: string[]) => {
      const rows = branchRecords(allRecords, mode, path);
      if (path.length === treeLevels[mode].length) return;
      const children = grouped(rows, treeLevels[mode][path.length]);
      const parent = sumRecords(rows);
      assert(
        Math.abs(children.reduce((s, n) => s + n.value, 0) - parent) < 1e-9,
      );
      assert(
        Math.abs(
          children.reduce((s, n) => s + share(n.value, parent), 0) - 100,
        ) < 1e-8,
      );
      for (const c of children) check([...path, c.name]);
    };
    check([]);
  }
});
test("25 districts and 300 anonymous endpoints retain unique observation IDs", () => {
  assert.equal(districtMetrics(allRecords).length, 25);
  assert.equal(new Set(allRecords.map((r) => r.endpointId)).size, 300);
  assert.equal(new Set(allRecords.map((r) => r.id)).size, allRecords.length);
  assert.equal(share(0, 0), 0);
  assert(
    Math.abs(
      districtMetrics(allRecords).reduce((s, d) => s + d.share, 0) - 100,
    ) < 1e-8,
  );
});
