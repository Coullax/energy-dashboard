"use client";

import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import { ArrowUpRight, CircleHelp, MoveRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  cells,
  sources,
  sectors,
  palette,
  total,
  sourceData,
  sectorData,
  energy,
  format,
  conversions,
  yearFactor,
  type Filters,
  type Datum,
} from "@/lib/energy";

function Ready({
  children,
  height = 240,
}: {
  children: React.ReactNode;
  height?: number;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div style={{ height, minWidth: 0, width: "100%" }}>
      {ready ? (
        children
      ) : (
        <Skeleton className="size-full rounded-xl opacity-40" />
      )}
    </div>
  );
}
function ChartTip({
  active,
  items,
  label,
  unit,
}: {
  active?: boolean;
  items: { name: string; value: number; color?: string }[];
  label?: string | number;
  unit: string;
}) {
  if (!active || !items.length) return null;
  return (
    <div className="chart-tooltip">
      <p>{label || "Energy composition"}</p>
      {items.map((p, i) => (
        <div key={i}>
          <span>
            <i style={{ background: p.color }} />
            {p.name}
          </span>
          <b>
            {format(p.value)} <small>{unit}</small>
          </b>
        </div>
      ))}
    </div>
  );
}
export function Legend({
  items,
}: {
  items: { name: string; color: string }[];
}) {
  return (
    <div className="chart-legend">
      {items.map((r) => (
        <span key={r.name}>
          <i style={{ background: r.color }} />
          {r.name}
        </span>
      ))}
    </div>
  );
}
export function FlowChart({ filters }: { filters: Filters }) {
  const id = useId().replaceAll(":", ""),
    reduce = useReducedMotion(),
    [active, setActive] = useState<string | null>(null),
    sum = total(filters),
    m = cells(filters);
  if (!sum)
    return (
      <div className="chart-empty">
        <MoveRight />
        <b>No matching energy flow</b>
        <p>Try another energy source or sector.</p>
      </div>
    );
  let ly = 52,
    ry = 52;
  const left = sourceData(filters)
    .filter((r) => r.value > 0)
    .map((r) => {
      let h = (r.value / sum) * 225;
      const n = { ...r, index: sources.indexOf(r.name), y: ly, h };
      ly += h + 25;
      return n;
    });
  const right = sectorData(filters)
    .filter((r) => r.value > 0)
    .map((r) => {
      let h = (r.value / sum) * 225;
      const n = { ...r, index: sectors.indexOf(r.name), y: ry, h };
      ry += h + 25;
      return n;
    });
  const lo: Record<number, number> = {},
    ro: Record<number, number> = {};
  const links = left.flatMap((l) =>
    right.flatMap((r) => {
      const value = m[l.index][r.index];
      if (!value) return [];
      const h = (value / sum) * 225,
        a = l.y + (lo[l.index] || 0),
        b = r.y + (ro[r.index] || 0);
      lo[l.index] = (lo[l.index] || 0) + h;
      ro[r.index] = (ro[r.index] || 0) + h;
      return [
        {
          key: l.name + "-" + r.name,
          d: `M166 ${a} C280 ${a} 385 ${b} 500 ${b} L500 ${b + h} C385 ${b + h} 280 ${a + h} 166 ${a + h}Z`,
          color: l.color,
          index: l.index,
          label: `${l.name} → ${r.name} · ${energy(value, filters.unit)} ${filters.unit}`,
        },
      ];
    }),
  );
  return (
    <>
      <div className="flow-summary">
        <span>
          <i className="live-dot" />
          Source-to-sector explorer
        </span>
        <b>
          {energy(sum, filters.unit)} <small>{filters.unit} total</small>
        </b>
      </div>
      <div className="flow-scroll">
        <svg
          className="flow-svg"
          viewBox="0 0 700 420"
          aria-label="Energy flow from source to final consumption"
        >
          <defs>
            {left.map((r) => (
              <linearGradient key={r.index} id={id + "-" + r.index}>
                <stop stopColor={r.color} stopOpacity=".72" />
                <stop offset="1" stopColor={r.color} stopOpacity=".24" />
              </linearGradient>
            ))}
          </defs>
          <text className="svg-overline" x="0" y="20">
            ENERGY SOURCES
          </text>
          <text className="svg-overline" x="530" y="20">
            FINAL CONSUMPTION
          </text>
          {links.map((l, i) => (
            <motion.path
              key={l.key}
              d={l.d}
              fill={`url(#${id}-${l.index})`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: active && active !== l.key ? 0.18 : 1 }}
              transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.025 }}
              tabIndex={0}
              role="button"
              aria-label={l.label}
              onMouseEnter={() => setActive(l.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(l.key)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === l.key ? null : l.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(active === l.key ? null : l.key);
                }
              }}
            >
              <title>{l.label}</title>
            </motion.path>
          ))}
          {left.map((r) => (
            <g key={r.name}>
              <rect
                x="154"
                y={r.y}
                width="12"
                height={r.h}
                rx="4"
                fill={r.color}
              />
              <circle cx="6" cy={r.y + r.h / 2 - 5} r="3.5" fill={r.color} />
              <text className="svg-label" x="18" y={r.y + r.h / 2 - 2}>
                {r.name}
              </text>
              <text className="svg-value" x="18" y={r.y + r.h / 2 + 16}>
                {energy(r.value, filters.unit)}
                <tspan> {filters.unit}</tspan>
              </text>
            </g>
          ))}
          {right.map((r, i) => (
            <g key={r.name}>
              <rect
                x="500"
                y={r.y}
                width="12"
                height={r.h}
                rx="4"
                fill={["#32725b", "#659c7f", "#8cb59a", "#bad0bb"][i]}
              />
              <text className="svg-label" x="530" y={r.y + r.h / 2 - 2}>
                {r.name}
              </text>
              <text className="svg-value" x="530" y={r.y + r.h / 2 + 16}>
                {energy(r.value, filters.unit)}
                <tspan> {filters.unit}</tspan>
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flow-hint" aria-live="polite">
        {active
          ? links.find((l) => l.key === active)?.label
          : "Hover, focus or select a flow to explore its contribution"}
      </div>
      <Legend items={sourceData(filters)} />
    </>
  );
}
export function MixChart({ data, unit }: { data: Datum[]; unit: string }) {
  const [kind, setKind] = useState("doughnut"),
    reduce = useReducedMotion(),
    sum = data.reduce((s, r) => s + r.value, 0);
  return (
    <>
      <div className="chart-toolbar">
        <span>FUEL COMPOSITION</span>
        <div className="segment-control">
          {["doughnut", "pie"].map((k) => (
            <button
              key={k}
              className={kind === k ? "active" : ""}
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
            >
              {k === "pie" ? "Pie" : "Doughnut"}
            </button>
          ))}
        </div>
      </div>
      <div className="mix-layout">
        <div className="pie-container">
          <Ready height={210}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter((r) => r.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={kind === "pie" ? 0 : "69%"}
                  outerRadius="88%"
                  paddingAngle={
                    data.filter((r) => r.value > 0).length > 1 ? 2 : 0
                  }
                  cornerRadius={3}
                  stroke="none"
                  animationDuration={650}
                  isAnimationActive={!reduce}
                >
                  {data
                    .filter((r) => r.value > 0)
                    .map((r) => (
                      <Cell key={r.name} fill={r.color} />
                    ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTip
                      active={active}
                      items={(payload || []).map((p) => ({
                        name: String(p.name),
                        value: Number(p.value),
                        color: p.payload?.fill,
                      }))}
                      unit={unit}
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Ready>
          {kind === "doughnut" && (
            <div className="pie-center">
              <b>{format(sum)}</b>
              <span>TOTAL {unit}</span>
            </div>
          )}
        </div>
        <div className="mix-list">
          {data.map((r) => (
            <div key={r.name}>
              <div>
                <span>
                  <i style={{ background: r.color }} />
                  {r.name}
                </span>
                <b>
                  {sum ? format((r.value / sum) * 100, 1) : 0}
                  <small>%</small>
                </b>
              </div>
              <div className="mix-meter">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${sum ? (r.value / sum) * 100 : 0}%` }}
                  transition={{ duration: reduce ? 0 : 0.6 }}
                  style={{ background: r.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-insight">
        <TrendingUp />
        <span>
          <b>Explore the transition.</b> Filters reveal how each energy source
          contributes.
        </span>
      </div>
    </>
  );
}
export function TrendChart({
  filters,
  forecast,
}: {
  filters: Filters;
  forecast: boolean;
}) {
  const reduce = useReducedMotion(),
    id = useId().replaceAll(":", ""),
    data = [2020, 2021, 2022, 2023, 2024].map((y) => ({
      year: String(y),
      actual:
        total({ ...filters, year: String(y) }) * conversions[filters.unit],
      projection: undefined as number | undefined,
    }));
  const end = data[4].actual,
    projected = end + (end - data[0].actual) / 4;
  if (forecast) {
    data[4].projection = end;
    data.push({
      year: "2025*",
      actual: undefined as unknown as number,
      projection: projected,
    });
  }
  return (
    <>
      <div className="chart-toolbar">
        <Legend
          items={[
            { name: "Final consumption", color: palette[0] },
            ...(forecast ? [{ name: "Projection", color: palette[3] }] : []),
          ]}
        />
        <Badge variant="secondary">{filters.unit} · Annual</Badge>
      </div>
      <Ready height={230}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 14, right: 16, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop stopColor={palette[0]} stopOpacity={0.24} />
                <stop offset="1" stopColor={palette[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 5"
              stroke="var(--chart-grid)"
            />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--chart-label)", fontSize: 10 }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--chart-label)", fontSize: 10 }}
              tickFormatter={(n) =>
                n >= 1000 ? format(n / 1000, 0) + "k" : format(n, 0)
              }
              width={45}
            />
            <ChartTooltip
              content={({ active, payload, label }) => (
                <ChartTip
                  active={active}
                  label={String(label)}
                  items={(payload || [])
                    .filter((p) => p.value !== undefined)
                    .map((p) => ({
                      name:
                        p.dataKey === "projection"
                          ? "Projection"
                          : "Consumption",
                      value: Number(p.value),
                      color: p.color,
                    }))}
                  unit={filters.unit}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke={palette[0]}
              strokeWidth={2.5}
              fill={`url(#${id})`}
              dot={{ r: 3, fill: "var(--card)", strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 3, stroke: "var(--card)" }}
              isAnimationActive={!reduce}
            />
            {forecast && (
              <Area
                type="linear"
                dataKey="projection"
                stroke={palette[3]}
                strokeDasharray="5 5"
                strokeWidth={2}
                fill="none"
                isAnimationActive={!reduce}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Ready>
      <p className="chart-note">
        {forecast
          ? "* Linear projection from synthetic 2020–2024 endpoints. Not a validated forecast."
          : "Synthetic annual observations · hover a point to inspect a year."}
      </p>
    </>
  );
}
export function HorizontalBars({
  data,
  unit,
}: {
  data: Datum[];
  unit: string;
}) {
  const max = Math.max(...data.map((r) => r.value), 1),
    reduce = useReducedMotion();
  return (
    <div className="horizontal-bars">
      {data.map((r) => (
        <Tooltip key={r.name}>
          <TooltipTrigger asChild>
            <div className="hbar-row" tabIndex={0}>
              <div>
                <span>
                  <i style={{ background: r.color }} />
                  {r.name}
                </span>
                <b>
                  {format(r.value)} <small>{unit}</small>
                </b>
              </div>
              <div className="hbar-track">
                <motion.div
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${(r.value / max) * 100}%` }}
                  transition={{
                    duration: reduce ? 0 : 0.7,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  style={{
                    background: `linear-gradient(90deg,color-mix(in srgb,${r.color} 65%,white),${r.color})`,
                  }}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {r.name} · {format(r.value)} {unit}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
export function ColumnChart({
  data,
  unit,
  year,
  compare,
}: {
  data: Datum[];
  unit: string;
  year: string;
  compare: string;
}) {
  const reduce = useReducedMotion();
  return (
    <>
      <Ready height={285}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 25, right: 8, left: -15, bottom: 12 }}
            barGap={4}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 5"
              stroke="var(--chart-grid)"
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--chart-label)", fontSize: 9 }}
              tickFormatter={(v) =>
                String(v).length > 15 ? String(v).slice(0, 12) + "…" : String(v)
              }
              interval={0}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--chart-label)", fontSize: 10 }}
              tickFormatter={(n) =>
                n >= 1000 ? format(n / 1000, 0) + "k" : format(n, 0)
              }
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
              content={({ active, payload, label }) => (
                <ChartTip
                  active={active}
                  label={String(label)}
                  items={(payload || []).map((p) => ({
                    name: p.dataKey === "previous" ? compare : year,
                    value: Number(p.value),
                    color: p.color,
                  }))}
                  unit={unit}
                />
              )}
            />
            <Bar
              dataKey="previous"
              name={compare}
              fill="var(--comparison)"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
              isAnimationActive={!reduce}
            />
            <Bar
              dataKey="value"
              name={year}
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
              isAnimationActive={!reduce}
            >
              {data.map((r) => (
                <Cell key={r.name} fill={r.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Ready>
      <Legend
        items={[
          { name: year, color: palette[0] },
          { name: compare, color: "var(--comparison)" },
        ]}
      />
    </>
  );
}
export function BuildingChart({
  data,
  unit,
}: {
  data: { name: string; value: number }[];
  unit: string;
}) {
  const reduce = useReducedMotion(),
    mix = [0.5, 0.2, 0.15, 0.1, 0.05],
    rows = data.map((r) =>
      Object.fromEntries([
        ["name", r.name],
        ...sources.map((s, i) => [s, r.value * mix[i]]),
      ]),
    );
  return (
    <Ready height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ left: 8, right: 18, top: 10, bottom: 0 }}
          barSize={23}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 5"
            stroke="var(--chart-grid)"
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: "var(--chart-label)" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={112}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--chart-label)" }}
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={({ active, payload, label }) => (
              <ChartTip
                active={active}
                label={String(label)}
                items={(payload || []).map((p) => ({
                  name: String(p.name),
                  value: Number(p.value),
                  color: p.color,
                }))}
                unit={unit}
              />
            )}
          />
          {sources.map((s, i) => (
            <Bar
              key={s}
              dataKey={s}
              stackId="energy"
              fill={palette[i]}
              radius={i === 4 ? [0, 5, 5, 0] : [0, 0, 0, 0]}
              isAnimationActive={!reduce}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Ready>
  );
}
