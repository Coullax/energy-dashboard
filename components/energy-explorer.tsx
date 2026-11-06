"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Download,
  FileSpreadsheet,
  GitBranch,
  Home,
  MapPinned,
  Search,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MixChart } from "./energy-charts";
import { SriLankaMap } from "./sri-lanka-map";
import {
  energy,
  format,
  palette,
  sources,
  conversions,
  type Filters,
} from "@/lib/energy";
import {
  filterRecords,
  grouped,
  branchRecords,
  sumRecords,
  share,
  districtMetrics,
  treeLevels,
  dimensionLabel,
  recordCSV,
  type TreeMode,
  type EnergyRecord,
} from "@/lib/energy-tree";

function download(rows: EnergyRecord[], filters: Filters) {
  const url = URL.createObjectURL(
    new Blob([recordCSV(rows, filters)], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `energy-tree-${filters.year}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function WorkbookLink() {
  return (
    <Button variant="outline" asChild>
      <a href="/data/Sri_Lanka_Energy_Tree.xlsx" download>
        <FileSpreadsheet />
        Excel tree · 2024 sample
      </a>
    </Button>
  );
}
function MiniStat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Zap;
}) {
  return (
    <div className="explore-stat">
      <span>
        {label}
        <Icon size={15} />
      </span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
function SampleNote() {
  return (
    <p className="explore-note">
      <ShieldCheck size={14} />
      Synthetic sample · 2024 baseline: 450 PJ across 300 representative
      endpoints. Other years use illustrative multipliers. Values illustrate
      allocation, not realistic individual meter readings, official statistics
      or plant generation.
    </p>
  );
}

export function EnergyTreeExplorer({
  filters,
  initialDistrict = "",
  onMap,
}: {
  filters: Filters;
  initialDistrict?: string;
  onMap: () => void;
}) {
  const [mode, setMode] = useState<TreeMode>(
      initialDistrict ? "users" : "sources",
    ),
    [path, setPath] = useState<string[]>(() => {
      if (!initialDistrict) return [];
      const d = districtMetrics(filterRecords(filters)).find(
        (d) => d.name === initialDistrict,
      );
      return d ? [d.province, d.name] : [];
    }),
    [query, setQuery] = useState("");
  const rows = useMemo(() => filterRecords(filters), [filters]);
  // A path is valid independently of the global source/sector filters. Empty branches remain explicit.
  const branch = useMemo(
    () => branchRecords(rows, mode, path),
    [rows, mode, path],
  );
  const rootTotal = sumRecords(rows),
    branchTotal = sumRecords(branch);
  const dimension = treeLevels[mode][path.length],
    children = dimension ? grouped(branch, dimension) : [],
    visible = children.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()),
    );
  const endpoints = new Set(branch.map((r) => r.endpointId)).size;
  const parentTotal = sumRecords(branchRecords(rows, mode, path.slice(0, -1)));
  const chartData = grouped(branch, "source").map((r, i) => ({
    name: r.name,
    value: r.value * conversions[filters.unit],
    color:
      palette[sources.indexOf(r.name as (typeof sources)[number])] ??
      palette[0],
  }));
  const choose = (name: string) => {
    setPath((p) => [...p, name]);
    setQuery("");
  };
  return (
    <div className="energy-explorer">
      <div className="explore-intro">
        <div>
          <span className="explore-eyebrow">
            <GitBranch size={14} /> FOLLOW THE ENERGY
          </span>
          <h2>One country. Every connection.</h2>
          <p>
            Move from a national total to a source, a district, and the
            household or site behind it.
          </p>
        </div>
        <WorkbookLink />
      </div>
      <div className="explore-stats">
        <MiniStat
          label="Selected branch"
          value={`${energy(branchTotal, filters.unit)} ${filters.unit}`}
          detail={`${filters.year} · ${path.at(-1) ?? "Sri Lanka"}`}
          icon={Zap}
        />
        <MiniStat
          label="Share of filtered total"
          value={`${format(share(branchTotal, rootTotal))}%`}
          detail={`${format(share(branchTotal, path.length ? parentTotal : rootTotal))}% of parent branch`}
          icon={ArrowDownRight}
        />
        <MiniStat
          label="Anonymous endpoints"
          value={String(endpoints)}
          detail={`${branch.length.toLocaleString()} source-level records`}
          icon={Users}
        />
        <MiniStat
          label="Drill-down depth"
          value={`${path.length} / 5`}
          detail={
            dimension
              ? `Next: ${dimensionLabel[dimension]}`
              : "Household / site reached"
          }
          icon={GitBranch}
        />
      </div>
      <div className="tree-mode-bar">
        <div className="segment-control">
          <button
            aria-pressed={mode === "sources"}
            className={mode === "sources" ? "active" : ""}
            onClick={() => {
              setMode("sources");
              setPath([]);
              setQuery("");
            }}
          >
            By energy source
          </button>
          <button
            aria-pressed={mode === "users"}
            className={mode === "users" ? "active" : ""}
            onClick={() => {
              setMode("users");
              setPath([]);
              setQuery("");
            }}
          >
            By location & user
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={onMap}>
          <MapPinned />
          Open district atlas
          <ArrowRight />
        </Button>
      </div>
      <nav className="tree-breadcrumb" aria-label="Energy tree path">
        <button
          onClick={() => {
            setPath([]);
            setQuery("");
          }}
        >
          <Home size={13} />
          Sri Lanka
        </button>
        {path.map((p, i) => (
          <span key={i}>
            <ChevronRight size={12} />
            <button
              onClick={() => {
                setPath(path.slice(0, i + 1));
                setQuery("");
              }}
            >
              {p}
            </button>
          </span>
        ))}
      </nav>
      <div className="tree-workspace">
        <section className="explore-panel branch-panel">
          <div className="explore-panel-heading">
            <div>
              <h3>
                {dimension ? dimensionLabel[dimension] : "Endpoint details"}
              </h3>
              <p>
                {dimension
                  ? "Select a branch to see its children."
                  : "This is the lowest level of the sample tree."}
              </p>
            </div>
            {path.length > 0 && (
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Go up one level"
                onClick={() => setPath(path.slice(0, -1))}
              >
                <ChevronLeft />
              </Button>
            )}
          </div>
          {dimension && (
            <label className="branch-search">
              <Search size={14} />
              <Input
                aria-label="Search branches"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${dimensionLabel[dimension].toLowerCase()}…`}
              />
            </label>
          )}
          <div className="branch-list">
            {visible.map((c, i) => (
              <motion.button
                layout
                key={c.name}
                className="branch-row"
                onClick={() => choose(c.name)}
              >
                <span
                  className="branch-dot"
                  style={{ background: palette[i % palette.length] }}
                />
                <span className="branch-name">
                  <b>{c.name}</b>
                  <small>
                    {new Set(c.records.map((r) => r.endpointId)).size} endpoint
                    {new Set(c.records.map((r) => r.endpointId)).size === 1
                      ? ""
                      : "s"}{" "}
                    · {energy(c.value, filters.unit)} {filters.unit}
                  </small>
                  <span className="branch-track">
                    <span
                      style={{
                        width: `${share(c.value, branchTotal)}%`,
                        background: palette[i % palette.length],
                      }}
                    />
                  </span>
                </span>
                <span className="branch-percentage">
                  <b>{format(share(c.value, branchTotal))}%</b>
                  <small>of this branch</small>
                </span>
                <ChevronRight size={15} />
              </motion.button>
            ))}
          </div>
          {dimension && visible.length === 0 && (
            <div className="explore-empty">
              No records match this branch and the current filters. Go up a
              level or reset filters.
            </div>
          )}
          {!dimension && branch[0] && (
            <div className="endpoint-card">
              <div className="endpoint-icon">
                <Home />
              </div>
              <h3>{branch[0].endpointId}</h3>
              <p>{branch[0].endpointType}</p>
              <dl>
                <dt>District</dt>
                <dd>{branch[0].district}</dd>
                <dt>Sector</dt>
                <dd>{branch[0].sector}</dd>
                <dt>Energy source</dt>
                <dd>{branch[0].source}</dd>
                <dt>Capture method</dt>
                <dd>{branch[0].inputMethod}</dd>
                <dt>Data status</dt>
                <dd>Synthetic example</dd>
              </dl>
              <p>
                No names, addresses or real meter IDs are stored in this
                demonstration.
              </p>
            </div>
          )}
        </section>
        <section className="explore-panel mix-panel">
          <div className="explore-panel-heading">
            <div>
              <h3>Energy mix in this branch</h3>
              <p>
                {path.at(-1) ?? "Sri Lanka"} · percentages sum to 100% when data
                is present
              </p>
            </div>
            <Zap size={17} />
          </div>
          {branch.length ? (
            <MixChart data={chartData} unit={filters.unit} />
          ) : (
            <div className="explore-empty">
              No energy records in this branch.
            </div>
          )}
          <div className="share-explainer">
            <b>Two percentages, clear meaning.</b>
            <p>
              “Of this branch” compares siblings. “Of filtered total” compares
              this selection with all records matching the year, source and
              sector filters above.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => download(branch, filters)}
            disabled={!branch.length}
          >
            <Download />
            Export this branch CSV
          </Button>
        </section>
      </div>
      <section className="explore-panel">
        <div className="explore-panel-heading">
          <div>
            <h3>Records behind the number</h3>
            <p>
              Every visible total can be traced to an anonymous endpoint and
              input method. Showing {Math.min(branch.length, 12)} of{" "}
              {branch.length} records; export includes all.
            </p>
          </div>
          <span className="sample-chip">SAMPLE RECORDS</span>
        </div>
        <div className="endpoint-table-scroll">
          <table className="endpoint-table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Type / location</th>
                <th>Source</th>
                <th>Energy ({filters.unit})</th>
                <th>Of branch</th>
                <th>Captured via</th>
              </tr>
            </thead>
            <tbody>
              {branch.slice(0, 12).map((r) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.endpointId}</b>
                  </td>
                  <td>
                    {r.endpointType}
                    <small>
                      {r.district} · {r.province}
                    </small>
                  </td>
                  <td>{r.source}</td>
                  <td>{energy(r.pj, filters.unit)}</td>
                  <td>{format(share(r.pj, branchTotal), 2)}%</td>
                  <td>{r.inputMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <SampleNote />
    </div>
  );
}

export function EnergyAtlas({
  filters,
  onExplore,
}: {
  filters: Filters;
  onExplore: (district: string) => void;
}) {
  const rows = useMemo(() => filterRecords(filters), [filters]),
    metrics = useMemo(() => districtMetrics(rows), [rows]);
  const [district, setDistrict] = useState("Colombo"),
    [metric, setMetric] = useState<"consumption" | "renewable">("consumption");
  const selected = metrics.find((m) => m.name === district)!;
  const mixes = grouped(selected.records, "source").map((r, i) => ({
    name: r.name,
    value: r.value * conversions[filters.unit],
    color:
      palette[sources.indexOf(r.name as (typeof sources)[number])] ??
      palette[0],
  }));
  const first = metrics[0],
    national = sumRecords(rows);
  return (
    <div className="energy-explorer atlas-explorer">
      <div className="explore-intro">
        <div>
          <span className="explore-eyebrow">
            <MapPinned size={14} /> ENERGY HAS A PLACE
          </span>
          <h2>A closer look at Sri Lanka.</h2>
          <p>
            Explore 25 districts in 3D. Select a place to see its energy use and
            the sources behind it.
          </p>
        </div>
        <WorkbookLink />
      </div>
      <div className="explore-stats">
        <MiniStat
          label="Filtered national use"
          value={`${energy(national, filters.unit)} ${filters.unit}`}
          detail={`${filters.year} · synthetic final-use data`}
          icon={Zap}
        />
        <MiniStat
          label="Districts in view"
          value="25"
          detail="9 provinces · district boundaries"
          icon={MapPinned}
        />
        <MiniStat
          label="Largest district share"
          value={`${format(first.share)}%`}
          detail={
            first.value
              ? `${first.name} · ${energy(first.value, filters.unit)} ${filters.unit}`
              : "No matching records"
          }
          icon={ArrowDownRight}
        />
        <MiniStat
          label="Anonymous endpoints"
          value={String(new Set(rows.map((r) => r.endpointId)).size)}
          detail="Households, meters, fleets and facilities"
          icon={Users}
        />
      </div>
      <div className="atlas-main">
        <section>
          <div className="atlas-toolbar">
            <div className="segment-control">
              <button
                className={metric === "consumption" ? "active" : ""}
                aria-pressed={metric === "consumption"}
                onClick={() => setMetric("consumption")}
              >
                Energy consumption
              </button>
              <button
                className={metric === "renewable" ? "active" : ""}
                aria-pressed={metric === "renewable"}
                onClick={() => setMetric("renewable")}
              >
                Renewable share
              </button>
            </div>
            <span>Illustrative district allocations</span>
          </div>
          <SriLankaMap
            metrics={metrics}
            selected={district}
            onSelect={setDistrict}
            unit={filters.unit}
            metric={metric}
          />
          <p className="map-credit">
            Boundaries:{" "}
            <a
              href="https://www.geoboundaries.org/api/current/gbOpen/LKA/ADM2/"
              target="_blank"
              rel="noreferrer"
            >
              geoBoundaries
            </a>{" "}
            / OpenStreetMap–Wambacher, ODbL 1.0 (2017). Height shows energy, not
            terrain. Renewable share includes biomass, hydro, solar and wind; it
            is not a sustainability rating.
          </p>
        </section>
        <section className="explore-panel district-detail">
          <div className="explore-panel-heading">
            <span className="sample-chip">DISTRICT INSIGHT</span>
            <MapPinned size={17} />
          </div>
          <p className="district-province">{selected.province} Province</p>
          <h3>{selected.name}</h3>
          <div className="district-value">
            {energy(selected.value, filters.unit)}
            <span>{filters.unit}</span>
          </div>
          <div className="district-insight-grid">
            <div>
              <b>{format(selected.share)}%</b>
              <span>of filtered total</span>
            </div>
            <div>
              <b>{format(selected.renewableShare)}%</b>
              <span>renewable share</span>
            </div>
            <div>
              <b>{selected.endpoints}</b>
              <span>sample endpoints</span>
            </div>
            <div>
              <b>{selected.records.length}</b>
              <span>energy records</span>
            </div>
          </div>
          <div className="district-source-list">
            <h4>Where the energy comes from</h4>
            {mixes.map((m, i) => (
              <div key={m.name}>
                <span>
                  <i style={{ background: m.color }} />
                  {m.name}
                </span>
                <b>
                  {format(
                    share(m.value, selected.value * conversions[filters.unit]),
                  )}
                  %
                </b>
              </div>
            ))}
          </div>
          <Button
            onClick={() => onExplore(district)}
            disabled={!selected.records.length}
          >
            Drill into {district}
            <ArrowRight />
          </Button>
          <small>
            Province → district → sector → source → household or site
          </small>
        </section>
      </div>
      <section className="explore-panel district-ranking">
        <div className="explore-panel-heading">
          <div>
            <h3>Compare districts</h3>
            <p>
              Select a district here or on the map. These buttons also provide
              keyboard access.
            </p>
          </div>
          <span className="sample-chip">% OF FILTERED TOTAL</span>
        </div>
        <div className="district-ranking-grid">
          {metrics.map((d, i) => (
            <button
              key={d.id}
              className={district === d.name ? "selected" : ""}
              onClick={() => setDistrict(d.name)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>{d.name}</b>
                <div className="branch-track">
                  <span
                    style={{
                      width: `${share(d.value, Math.max(first.value, 0.001))}%`,
                    }}
                  />
                </div>
              </div>
              <strong>{format(d.share)}%</strong>
              <ChevronRight size={13} />
            </button>
          ))}
        </div>
      </section>
      <SampleNote />
    </div>
  );
}
