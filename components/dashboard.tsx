"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Zap,
  Droplets,
  Diamond,
  Leaf,
  TrendingUp,
  Target,
  Building2,
  Upload,
  ClipboardCheck,
  FileBarChart2,
  Settings2,
  ChevronRight,
  ArrowUpRight,
  Download,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Info,
  Command,
  Menu,
  Moon,
  Sun,
  Plus,
  ShieldCheck,
  LockKeyhole,
  Database,
  History,
  Check,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock3,
  LogOut,
  ArrowRight,
  ExternalLink,
  Printer,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { format as dateFormat } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  FlowChart,
  MixChart,
  TrendChart,
  HorizontalBars,
  ColumnChart,
  BuildingChart,
  Legend,
} from "@/components/energy-charts";
import { EnergyTable } from "@/components/energy-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  initialFilters,
  years,
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
  moduleConfigs,
  buildings,
  demoSubmissions,
  canReview,
  canSubmit,
  reviewRecord,
  csv,
  type Filters,
  type Datum,
  type Unit,
  type Role,
  type Submission,
} from "@/lib/energy";

const navigation: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "balance", label: "Energy balance", icon: ArrowLeftRight },
  { id: "electricity", label: "Electricity", icon: Zap },
  { id: "petroleum", label: "Petroleum", icon: Droplets },
  { id: "coal", label: "Coal", icon: Diamond },
  { id: "biomass", label: "Biomass", icon: Leaf },
  { id: "economic", label: "Economic indicators", icon: TrendingUp },
  { id: "emissions", label: "Grid emissions", icon: Target },
  { id: "buildings", label: "Buildings & ISIC", icon: Building2 },
];
const workspace = [
  { id: "submissions", label: "Data submissions", icon: Upload },
  { id: "review", label: "Verification queue", icon: ClipboardCheck },
  { id: "reports", label: "Reports & exports", icon: FileBarChart2 },
  { id: "admin", label: "Administration", icon: Settings2 },
];
const allPages = [...navigation, ...workspace];
type Audit = { time: string; role: string; action: string; version: number };
const initialAudit: Audit[] = [
  {
    time: "Sample event",
    role: "Verifier · SLSEA",
    action: "Approved SUB-022",
    version: 1,
  },
];
function downloadFile(
  name: string,
  data: string,
  type = "text/csv;charset=utf-8",
) {
  const href = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
function SelectField({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("select-field", className)}>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
function Count({ value, digits = 1 }: { value: number; digits?: number }) {
  const raw = useMotionValue(0),
    spring = useSpring(raw, { stiffness: 80, damping: 22 }),
    display = useTransform(spring, (n) => format(n, digits)),
    reduce = useReducedMotion();
  useEffect(() => {
    raw.set(value);
  }, [value, raw]);
  return reduce ? (
    <span>{format(value, digits)}</span>
  ) : (
    <motion.span>{display}</motion.span>
  );
}
function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 72 30" className="metric-spark" aria-hidden="true">
      <path
        d="M1 26 10 22 18 23 29 13 38 17 47 8 56 12 63 5 71 2"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Metric({
  label,
  value,
  unit,
  note,
  icon: Icon = Zap,
  index = 0,
  onInfo,
  digits = 1,
}: {
  label: string;
  value: number;
  unit: string;
  note: string;
  icon?: LucideIcon;
  index?: number;
  onInfo: () => void;
  digits?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : index * 0.065, duration: 0.4 }}
      whileHover={reduce ? undefined : { y: -4 }}
      className={cn("metric", index === 0 && "metric-featured")}
    >
      <div className="metric-top">
        <span>
          <Icon />
          {label}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onInfo} aria-label={`Methodology for ${label}`}>
              <Info />
            </button>
          </TooltipTrigger>
          <TooltipContent>Calculation, assumptions and source</TooltipContent>
        </Tooltip>
      </div>
      <div className="metric-value">
        <Count value={value} digits={digits} />
        <small>{unit}</small>
      </div>
      <div className="metric-note">
        {index === 0 && (
          <span>
            <TrendingUp />
            Demo
          </span>
        )}
        {note}
      </div>
      <Sparkline color={index === 0 ? "#b9ef9b" : palette[index % 5]} />
    </motion.div>
  );
}
function Panel({
  title,
  description,
  action,
  children,
  className,
  footer,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  return (
    <Card className={cn("panel", className)}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
function Status({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "status-badge",
        status === "Approved"
          ? "approved"
          : status === "Awaiting review" || status === "Draft"
            ? "pending"
            : status === "Rejected"
              ? "rejected"
              : "revision",
      )}
    >
      <i />
      {status}
    </Badge>
  );
}
function Notice({
  children,
  icon: Icon = Info,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="notice">
      <Icon />
      <span>{children}</span>
    </div>
  );
}
function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

export function Dashboard() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={180}>
          <DashboardApp />
          <Toaster richColors position="bottom-right" closeButton />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
function DashboardApp() {
  const [page, setPage] = useState("overview"),
    [filters, setFilters] = useState<Filters>(initialFilters),
    [role, setRole] = useState<Role>("Viewer"),
    [compare, setCompare] = useState("2023"),
    [forecast, setForecast] = useState(false),
    [flowView, setFlowView] = useState("flow"),
    [mobileOpen, setMobileOpen] = useState(false),
    [methodOpen, setMethodOpen] = useState(false),
    [query, setQuery] = useState(""),
    [searchMessage, setSearchMessage] = useState(""),
    [moduleTab, setModuleTab] = useState("0"),
    [chartType, setChartType] = useState("columns"),
    [excluded, setExcluded] = useState<string[]>([]),
    [buildingType, setBuildingType] = useState("All building types"),
    [submissions, setSubmissions] = useState<Submission[]>(demoSubmissions),
    [audit, setAudit] = useState<Audit[]>(initialAudit),
    [coefficient, setCoefficient] = useState(0.52),
    [entryOpen, setEntryOpen] = useState(false),
    [editing, setEditing] = useState<Submission | null>(null),
    [reviewing, setReviewing] = useState<Submission | null>(null),
    [comment, setComment] = useState(""),
    [reportOpen, setReportOpen] = useState(false),
    [reportSections, setReportSections] = useState([
      "summary",
      "flow",
      "mix",
      "table",
    ]),
    [sessionReady, setSessionReady] = useState(false),
    [factorDraft, setFactorDraft] = useState("0.52");
  useEffect(() => {
    setFactorDraft(String(coefficient));
  }, [coefficient]);
  const searchRef = useRef<HTMLInputElement>(null),
    reduce = useReducedMotion();
  useEffect(() => {
    function sync() {
      const id = location.hash.slice(1);
      setPage(allPages.some((p) => p.id === id) ? id : "overview");
      setModuleTab("0");
      setExcluded([]);
      setMobileOpen(false);
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("slsea-next-demo-v1");
      if (saved) {
        const v = JSON.parse(saved);
        if (Array.isArray(v.submissions)) setSubmissions(v.submissions);
        if (Array.isArray(v.audit)) setAudit(v.audit);
        if (typeof v.coefficient === "number") setCoefficient(v.coefficient);
      }
    } catch {}
    setSessionReady(true);
  }, []);
  useEffect(() => {
    if (sessionReady)
      try {
        sessionStorage.setItem(
          "slsea-next-demo-v1",
          JSON.stringify({ submissions, audit, coefficient }),
        );
      } catch {}
  }, [sessionReady, submissions, audit, coefficient]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const navigate = (id: string) => {
    location.hash = id;
    setPage(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  };
  const changeFilter = (key: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));
  const current = allPages.find((p) => p.id === page)!,
    config = moduleConfigs[page];
  const factor = conversions[filters.unit],
    sum = total(filters);
  const sourceRows = sourceData(filters).map((r) => ({
    ...r,
    previous:
      (r.value / (yearFactor[filters.year] || 1)) * (yearFactor[compare] || 1),
  }));
  const convertRows = (rows: Datum[]) =>
    rows.map((r) => ({
      ...r,
      value: r.value * factor,
      previous: (r.previous || 0) * factor,
    }));
  const moduleUnit =
    page === "electricity" ? (moduleTab === "1" ? "MW" : "GWh") : filters.unit;
  const moduleRows: Datum[] = config
    ? config.items
        .map((name, i) => {
          const value =
            config.values[i] *
            (yearFactor[filters.year] || 1) *
            (moduleTab === "1" ? 0.4 : moduleTab === "2" ? 0.75 : 1) *
            (page === "electricity" ? 1 : factor);
          return {
            name,
            value,
            previous:
              (value / (yearFactor[filters.year] || 1)) *
              (yearFactor[compare] || 1),
            color: palette[i % 5],
          };
        })
        .filter((r) => !excluded.includes(r.name))
    : [];
  const buildingRows = buildings.filter(
    (r) => buildingType === "All building types" || r.name === buildingType,
  );
  const emitAudit = (action: string, version = 1) =>
    setAudit((v) => [
      {
        time: new Date().toISOString(),
        role: `${role} · Demo workspace`,
        action,
        version,
      },
      ...v,
    ]);
  const exportData = () => {
    let rows: Datum[] = convertRows(sourceRows),
      unit: string = filters.unit;
    if (config) {
      rows = moduleRows;
      unit = moduleUnit;
    } else if (page === "buildings")
      rows = buildingRows.map((r, i) => ({
        name: r.name,
        value: r.value * (yearFactor[filters.year] || 1) * factor,
        color: palette[i],
      }));
    else if (page === "emissions") {
      unit = "tCO₂/MWh";
      rows = [
        { name: "Operating margin", value: 0.71 },
        { name: "Build margin", value: 0.33 },
        { name: "Combined margin", value: coefficient },
        { name: "Average emission factor", value: 0.48 },
      ].map((r, i) => ({
        ...r,
        value: r.value * (yearFactor[filters.year] || 1),
        color: palette[i],
      }));
    }
    downloadFile(`slsea-${page}-${filters.year}.csv`, csv(rows, filters, unit));
    toast.success("CSV downloaded", {
      description:
        "Includes period, units, filters and synthetic-data provenance.",
    });
  };
  const search = () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const target = /emission|carbon/.test(q)
      ? "emissions"
      : /building|isic|intensity/.test(q)
        ? "buildings"
        : /electric/.test(q)
          ? "electricity"
          : /petroleum|diesel|petrol/.test(q)
            ? "petroleum"
            : /biomass|fuelwood/.test(q)
              ? "biomass"
              : /coal/.test(q)
                ? "coal"
                : /energy|balance|consumption/.test(q)
                  ? "balance"
                  : null;
    if (!target) {
      setSearchMessage(
        "Try “Compare electricity in 2022 and 2024”, “building energy”, or “grid emissions”. Search uses structured query patterns.",
      );
      return;
    }
    const y = q.match(/202[0-4]/g);
    if (y) {
      changeFilter("year", y[y.length - 1]);
      setCompare(y[0]);
    }
    setSearchMessage(
      `Showing ${allPages.find((p) => p.id === target)?.label}${y ? ` · ${y[y.length - 1]} compared with ${y[0]}` : ""}. Structured query preview using synthetic data.`,
    );
    navigate(target);
  };
  const footer = (unit = filters.unit as string) => (
    <>
      <span>
        Synthetic demonstration data · {filters.year} · {unit}
      </span>
      <button onClick={() => setMethodOpen(true)}>
        Methodology <ArrowUpRight />
      </button>
    </>
  );
  const onInfo = () => setMethodOpen(true);
  const pending = submissions.filter(
    (s) => s.status === "Awaiting review",
  ).length;
  function renderSidebar() {
    return (
      <div className="sidebar-content">
        <button className="brand" onClick={() => navigate("overview")}>
          <span>
            <Zap fill="currentColor" />
          </span>
          <div>
            SLSEA<small>ENERGY INTELLIGENCE</small>
          </div>
        </button>
        <div className="country-switch">
          <span>LK</span>
          <b>Sri Lanka</b>
          <i className="live-dot" />
        </div>
        <p className="nav-caption">EXPLORE ENERGY</p>
        <nav>{navigation.map((item) => renderNavItem({ item }))}</nav>
        <p className="nav-caption workspace-caption">WORKSPACE</p>
        <nav>{workspace.map((item) => renderNavItem({ item }))}</nav>
        <div className="sidebar-card">
          <ArrowUpRight />
          <b>
            Better data.
            <br />A sustainable future.
          </b>
          <p>Insight for Sri Lanka’s energy transition.</p>
          <span>ENERGY BALANCE · CONCEPT</span>
        </div>
        <div className="sidebar-profile">
          <span>SL</span>
          <div>
            SLSEA workspace<small>Prototype environment</small>
          </div>
          <ShieldCheck />
        </div>
      </div>
    );
  }
  function renderNavItem({ item }: { item: (typeof navigation)[number] }) {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        className={cn("nav-item", page === item.id && "active")}
        onClick={() => navigate(item.id)}
        aria-current={page === item.id ? "page" : undefined}
      >
        {page === item.id && (
          <motion.span
            className="nav-active"
            layoutId="nav-highlight"
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
          />
        )}
        <Icon />
        <span>{item.label}</span>
        {item.id === "review" && pending > 0 ? (
          <small>{pending}</small>
        ) : page === item.id ? (
          <ChevronRight className="nav-chevron" />
        ) : null}
      </button>
    );
  }
  function renderOverview({ balance = false }: { balance?: boolean }) {
    const renewable = sourceData(filters)
      .filter((r) => ["Biomass", "Hydro", "Solar & wind"].includes(r.name))
      .reduce((s, r) => s + r.value, 0);
    return (
      <>
        <div className="metrics-grid">
          <Metric
            label="Final energy consumption"
            value={sum * factor}
            unit={filters.unit}
            note="Selected annual consumption"
            icon={Zap}
            index={0}
            onInfo={onInfo}
          />
          <Metric
            label="Renewable energy share"
            value={sum ? (renewable / sum) * 100 : 0}
            unit="%"
            note="Of selected final consumption"
            icon={Leaf}
            index={1}
            onInfo={onInfo}
          />
          <Metric
            label="Grid emission factor"
            value={coefficient * (yearFactor[filters.year] || 1)}
            unit="tCO₂/MWh"
            note="Illustrative combined margin"
            icon={Target}
            index={2}
            onInfo={onInfo}
            digits={3}
          />
          <Metric
            label="Reporting organisations"
            value={24}
            unit="entities"
            note="Synthetic reporting population"
            icon={Building2}
            index={3}
            onInfo={onInfo}
            digits={0}
          />
        </div>
        <div className="analytics-grid">
          <Panel
            title="A nation’s energy, connected"
            description={`Source-to-sector flow · ${filters.year} · ${filters.unit}`}
            action={
              <div className="segment-control">
                {["flow", "table"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setFlowView(v)}
                    className={flowView === v ? "active" : ""}
                  >
                    {v === "flow" ? "Flow" : "Table"}
                  </button>
                ))}
              </div>
            }
            footer={footer()}
          >
            {flowView === "flow" ? (
              <FlowChart filters={filters} />
            ) : (
              <EnergyTable
                data={convertRows(sourceRows)}
                year={filters.year}
                compare={compare}
                unit={filters.unit}
              />
            )}
          </Panel>
          <Panel
            title="What powers Sri Lanka?"
            description={`Final energy mix · ${filters.year}`}
            action={<Badge variant="secondary">{filters.unit}</Badge>}
            footer={footer()}
          >
            <MixChart data={convertRows(sourceRows)} unit={filters.unit} />
          </Panel>
        </div>
        <div className="analytics-grid">
          <Panel
            title="Energy use through the years"
            description="Annual final consumption · illustrative series"
            action={
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setForecast((v) => !v)}
              >
                {forecast ? "Hide projection" : "Show projection"}
                <ArrowUpRight />
              </Button>
            }
            footer={footer()}
          >
            <TrendChart filters={filters} forecast={forecast} />
          </Panel>
          <Panel
            title="Where energy is used"
            description={`Final consumption by sector · ${filters.year}`}
            action={<Badge variant="secondary">{filters.unit}</Badge>}
            footer={footer()}
          >
            <HorizontalBars
              data={convertRows(sectorData(filters))}
              unit={filters.unit}
            />
          </Panel>
        </div>
        {balance && (
          <Panel
            title="Annual Energy Balance"
            description="Compare source contributions and inspect the underlying dataset"
            action={
              <SelectField
                label="Compare year"
                value={compare}
                options={years}
                onChange={setCompare}
              />
            }
          >
            <EnergyTable
              data={convertRows(sourceRows)}
              unit={filters.unit}
              year={filters.year}
              compare={compare}
            />
            <Notice>
              The simplified flow reconciles to {energy(sum, filters.unit)}{" "}
              {filters.unit}. Production balances require approved imports,
              exports, transformations, stock changes and losses.
            </Notice>
          </Panel>
        )}
      </>
    );
  }
  function renderSectorModule() {
    return (
      <>
        <Notice>
          Concept view · {config.tabs[Number(moduleTab)]}.{" "}
          {page === "electricity"
            ? "Generation uses GWh; capacity uses illustrative MW. Load and sales are sample series."
            : "Values are synthetic and convert with the selected energy unit."}
        </Notice>
        <Tabs
          value={moduleTab}
          onValueChange={(v) => {
            setModuleTab(v);
            setExcluded([]);
          }}
          className="module-tabs"
        >
          <TabsList>
            {config.tabs.map((t, i) => (
              <TabsTrigger value={String(i)} key={t}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="analytics-grid">
          <Panel
            title={config.tabs[Number(moduleTab)]}
            description={`${filters.year} · ${moduleUnit} · Sample dataset`}
            action={
              <div className="segment-control">
                {["columns", "bars"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={t === chartType ? "active" : ""}
                  >
                    {t === "columns" ? "Columns" : "Bars"}
                  </button>
                ))}
              </div>
            }
            footer={footer(moduleUnit)}
          >
            <div className="category-chips">
              {config.items.map((name) => (
                <button
                  key={name}
                  aria-pressed={!excluded.includes(name)}
                  className={!excluded.includes(name) ? "selected" : ""}
                  onClick={() =>
                    setExcluded((v) =>
                      v.includes(name)
                        ? v.filter((n) => n !== name)
                        : [...v, name],
                    )
                  }
                >
                  {!excluded.includes(name) && <Check />}
                  {name}
                </button>
              ))}
            </div>
            {moduleRows.length ? (
              chartType === "columns" ? (
                <ColumnChart
                  data={moduleRows}
                  year={filters.year}
                  compare={compare}
                  unit={moduleUnit}
                />
              ) : (
                <HorizontalBars data={moduleRows} unit={moduleUnit} />
              )
            ) : (
              <div className="chart-empty">
                <SlidersHorizontal />
                <b>Select a category above</b>
              </div>
            )}
          </Panel>
          <Panel
            title="Historical comparison"
            description="Annual category totals across selected periods"
            action={
              <SelectField
                label="Compare"
                value={compare}
                options={years}
                onChange={setCompare}
              />
            }
            footer={footer(moduleUnit)}
          >
            <EnergyTable
              data={moduleRows}
              unit={moduleUnit}
              year={filters.year}
              compare={compare}
              firstLabel="Category"
            />
          </Panel>
        </div>
      </>
    );
  }
  function renderBuildings() {
    const data = buildingRows.map((r, i) => ({
      name: r.name,
      value: r.value * (yearFactor[filters.year] || 1) * factor,
      color: palette[i],
      previous: r.value * (yearFactor[compare] || 1) * factor,
    }));
    return (
      <>
        <Notice>
          ISIC building energy concept · Indicative codes and synthetic
          benchmarks require confirmation with SLSEA. Supports NDC 2.2–2.4
          reporting.
        </Notice>
        <div className="standalone-filter">
          <SelectField
            label="Building type"
            value={buildingType}
            options={["All building types", ...buildings.map((r) => r.name)]}
            onChange={setBuildingType}
          />
        </div>
        <div className="metrics-grid">
          <Metric
            label="Building energy"
            value={data.reduce((s, r) => s + r.value, 0)}
            unit={filters.unit}
            note="Selected building categories"
            icon={Building2}
            index={0}
            onInfo={onInfo}
          />
          <Metric
            label="Electricity EUI"
            value={
              buildingRows.reduce((s, r) => s + r.eui, 0) / buildingRows.length
            }
            unit="kWh/m²/yr"
            note="Unweighted sample mean"
            icon={Zap}
            index={1}
            onInfo={onInfo}
            digits={0}
          />
          <Metric
            label="Buildings represented"
            value={buildingRows.length * 48}
            unit="buildings"
            note="Synthetic building sample"
            index={2}
            onInfo={onInfo}
            digits={0}
          />
          <Metric
            label="Reporting coverage"
            value={86}
            unit="%"
            note="Illustrative reporting coverage"
            icon={ClipboardCheck}
            index={3}
            onInfo={onInfo}
          />
        </div>
        <div className="analytics-grid">
          <Panel
            title="Building energy composition"
            description={`Disaggregated fuel mix · ${filters.year}`}
            footer={footer()}
          >
            <BuildingChart data={data} unit={filters.unit} />
            <Legend
              items={sources.map((name, i) => ({ name, color: palette[i] }))}
            />
          </Panel>
          <Panel
            title="Energy use intensity"
            description="Electricity use per gross floor area"
            footer={footer("kWh/m²/year")}
          >
            <HorizontalBars
              data={buildingRows.map((r, i) => ({
                name: r.name,
                value: r.eui,
                color: palette[i],
              }))}
              unit="kWh/m²/yr"
            />
            <div className="chart-insight">
              <Info />
              <span>
                EUI = annual electricity use ÷ gross floor area. Compare
                buildings with similar use and occupancy.
              </span>
            </div>
          </Panel>
        </div>
        <Panel
          title="Building energy register"
          description="ISIC classification and annual performance"
        >
          <div className="table-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Building type</TableHead>
                  <TableHead>ISIC code</TableHead>
                  <TableHead className="text-right">
                    Consumption ({filters.unit})
                  </TableHead>
                  <TableHead className="text-right">EUI (kWh/m²/yr)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildingRows.map((r, i) => (
                  <TableRow key={r.code}>
                    <TableCell>
                      <span className="source-cell">
                        <i
                          style={
                            { "--token": palette[i] } as React.CSSProperties
                          }
                        >
                          {r.name[0]}
                        </i>
                        {r.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {r.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {energy(
                        r.value * (yearFactor[filters.year] || 1),
                        filters.unit,
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.eui}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>
      </>
    );
  }
  function renderEmissions() {
    const vals = [
        { name: "Operating margin", value: 0.71 },
        { name: "Build margin", value: 0.33 },
        { name: "Combined margin", value: coefficient },
        { name: "Average factor", value: 0.48 },
      ],
      data = vals.map((r, i) => ({
        ...r,
        value: r.value * (yearFactor[filters.year] || 1),
        previous: r.value * (yearFactor[compare] || 1),
        color: palette[i],
      }));
    return (
      <>
        <Notice>
          Demonstration factors only. Official calculations require approved
          methods, assumptions and source inputs.
        </Notice>
        <div className="metrics-grid">
          {data.map((r, i) => (
            <Metric
              key={r.name}
              label={r.name}
              value={r.value}
              unit="tCO₂/MWh"
              note="Synthetic annual factor"
              icon={Target}
              index={i}
              digits={3}
              onInfo={onInfo}
            />
          ))}
        </div>
        <div className="analytics-grid">
          <Panel
            title="Grid emission factors"
            description="Annual comparison · tCO₂/MWh"
            action={
              <SelectField
                label="Compare"
                value={compare}
                options={years}
                onChange={setCompare}
              />
            }
            footer={footer("tCO₂/MWh")}
          >
            <ColumnChart
              data={data}
              unit="tCO₂/MWh"
              year={filters.year}
              compare={compare}
            />
          </Panel>
          <Panel
            title="Calculation transparency"
            description="Illustrative combined-margin methodology"
          >
            <div className="formula-card">
              <span>DEMONSTRATION FORMULA</span>
              <p>
                0.5 × Operating margin
                <br />+ 0.5 × Build margin
              </p>
              <Separator />
              <b>
                0.520 <small>tCO₂/MWh</small>
              </b>
              <span>DEFAULT SAMPLE RESULT</span>
            </div>
            <p className="section-note">
              The administrator’s demo parameter can override this default. All
              production parameter versions and source references must be
              approved and traceable.
            </p>
            <Button variant="outline" size="sm" onClick={onInfo}>
              <Info />
              View methodology
            </Button>
          </Panel>
        </div>
      </>
    );
  }
  function renderAuditTrail() {
    return (
      <Panel
        title="Activity & audit trail"
        description="Session demonstration events · production retention: at least five years"
        action={
          <Badge variant="secondary">
            <History />
            {audit.length} events
          </Badge>
        }
      >
        <div className="table-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Version</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap">
                    {e.time === "Sample event"
                      ? e.time
                      : new Date(e.time).toLocaleString("en-GB", {
                          timeZone: "Asia/Colombo",
                        }) + " LK"}
                  </TableCell>
                  <TableCell>{e.role}</TableCell>
                  <TableCell className="max-w-100 whitespace-normal">
                    {e.action}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">v{e.version}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    );
  }
  const startEntry = (s: Submission | null = null) => {
    setEditing(s);
    setEntryOpen(true);
  };
  function renderSubmissionList({ review = false }: { review?: boolean }) {
    const rows = submissions.filter((s) =>
      review
        ? s.status === "Awaiting review"
        : role === "Data Provider"
          ? s.org === "CEB"
          : true,
    );
    return (
      <div className="table-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organisation / reference</TableHead>
              <TableHead>Dataset</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                {review ? "Decision" : "Version / action"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <span className="org-cell">
                    <i>{s.org.slice(0, 2)}</i>
                    <span>
                      {s.org}
                      <small>{s.id}</small>
                    </span>
                  </span>
                </TableCell>
                <TableCell>{s.dataset}</TableCell>
                <TableCell>{s.period}</TableCell>
                <TableCell>
                  <Status status={s.status} />
                </TableCell>
                <TableCell className="text-right">
                  {review ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReviewing(s);
                        setComment("");
                      }}
                    >
                      Review
                      <ArrowRight />
                    </Button>
                  ) : canSubmit(role) &&
                    s.org === "CEB" &&
                    ["Draft", "Revision requested"].includes(s.status) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEntry(s)}
                    >
                      Edit v{s.version}
                      <ArrowUpRight />
                    </Button>
                  ) : (
                    <Badge variant="outline">v{s.version}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No {review ? "pending " : ""}submissions to show.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
  function renderSubmissions() {
    return (
      <>
        <Notice icon={ShieldCheck}>
          Role preview: <b>{role}</b>. This is a simulated workspace with
          session-only storage. Choose Data Provider or Administrator to try
          data entry.
        </Notice>
        <div className="workflow-stats">
          {[
            {
              label: "All submissions",
              value: submissions.length,
              icon: FileSpreadsheet,
            },
            { label: "Awaiting review", value: pending, icon: Clock3 },
            {
              label: "Approved",
              value: submissions.filter((s) => s.status === "Approved").length,
              icon: CheckCircle2,
            },
          ].map((s) => (
            <Card key={s.label}>
              <s.icon />
              <div>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            </Card>
          ))}
        </div>
        <Panel
          title="Organisation submissions"
          description="Draft, validate and submit auditable energy records"
          action={
            canSubmit(role) && (
              <Button size="sm" onClick={() => startEntry()}>
                <Plus />
                New submission
              </Button>
            )
          }
        >
          {renderSubmissionList({})}
        </Panel>
        <Panel
          title="Structured data capture"
          description="Online form → validation → verification → approval"
        >
          <div className="capture-layout">
            <div className="capture-icon">
              <FileSpreadsheet />
            </div>
            <div>
              <h3>One consistent way to report energy data.</h3>
              <p>
                Use the demo online form or download the sample CSV template.
                Production Excel bulk import and approved templates remain part
                of the implementation scope.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadFile(
                  "demo-energy-template.csv",
                  "organisation,dataset,year,frequency,value,unit\r\nCEB,Electricity generation,2024,Annual,16200,GWh\r\n",
                )
              }
            >
              <Download />
              Demo CSV template
            </Button>
          </div>
        </Panel>
      </>
    );
  }
  function renderReview() {
    if (!canReview(role))
      return (
        <AccessState
          icon={ClipboardCheck}
          title="Your verification workspace"
          text="Choose Verifier or Administrator in the role preview to review submissions and explore the approval journey."
          action={() => setRole("Verifier")}
          actionLabel="Preview as Verifier"
        />
      );
    return (
      <>
        <Notice icon={ShieldCheck}>
          Verifier workspace · Approval decisions are simulated and recorded in
          the session audit trail.
        </Notice>
        <Panel
          title="Verification queue"
          description="Review data quality, record decisions and request corrections"
          action={
            <Badge className="pending status-badge">
              <Clock3 />
              {pending} awaiting review
            </Badge>
          }
        >
          {renderSubmissionList({ review: true })}
        </Panel>
        {renderAuditTrail()}
      </>
    );
  }
  function renderReports() {
    const choices = [
      ["summary", "Overview & key indicators"],
      ["flow", "Energy flow diagram"],
      ["mix", "Source composition chart"],
      ["table", "Source comparison table"],
    ];
    return (
      <div className="analytics-grid">
        <Panel
          title="Build your energy report"
          description="Choose the evidence to include in a printable summary"
        >
          <div className="report-options">
            {choices.map(([id, label]) => (
              <Label
                key={id}
                className={cn(reportSections.includes(id) && "selected")}
              >
                <Checkbox
                  checked={reportSections.includes(id)}
                  onCheckedChange={(v) =>
                    setReportSections((s) =>
                      v ? [...s, id] : s.filter((k) => k !== id),
                    )
                  }
                />
                <span>{label}</span>
                <FileBarChart2 />
              </Label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            <Button
              onClick={() =>
                reportSections.length
                  ? setReportOpen(true)
                  : toast.error("Select at least one report section")
              }
            >
              <FileBarChart2 />
              Preview report
              <ArrowRight />
            </Button>
            <Button variant="outline" onClick={exportData}>
              <Download />
              Export CSV
            </Button>
          </div>
        </Panel>
        <Panel
          title="Report metadata"
          description="Transparent provenance, periods and units"
        >
          <div className="metadata-grid">
            {[
              ["Reporting period", filters.year],
              ["Energy unit", filters.unit],
              ["Geography", "Sri Lanka · National"],
              ["Source filter", filters.source],
              ["Sector filter", filters.sector],
              ["Data source", "Synthetic demonstration data"],
              ["Verification status", "Illustrative"],
            ].map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
          <Notice>
            PDF uses your browser’s Print / Save as PDF. Native Excel, PNG/JPEG
            and server-generated reports remain production features.
          </Notice>
        </Panel>
      </div>
    );
  }
  function renderAdmin() {
    const draft = factorDraft,
      setDraft = setFactorDraft;
    if (role !== "Administrator")
      return (
        <AccessState
          icon={LockKeyhole}
          title="A controlled workspace for better data"
          text="Preview the Administrator role to explore calculation parameters, operational controls and the audit trail."
          action={() => setRole("Administrator")}
          actionLabel="Preview as Administrator"
        />
      );
    return (
      <>
        <Notice icon={ShieldCheck}>
          Administration concept · UI role selection is not authentication. MFA,
          RBAC, encryption, monitoring and backup services require a production
          backend.
        </Notice>
        <div className="analytics-grid">
          <Panel
            title="Calculation & validation rules"
            description="A versioned parameter registry for consistent calculations"
            action={
              <Badge variant="outline">
                <Settings2 />
                Configuration
              </Badge>
            }
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const value = Number(draft);
                if (!Number.isFinite(value) || value < 0 || value > 2) {
                  toast.error("Enter a factor between 0 and 2");
                  return;
                }
                setCoefficient(value);
                emitAudit(`Updated demo combined margin to ${value}`);
                toast.success("Parameter updated", {
                  description: "A session audit event was recorded.",
                });
              }}
            >
              <div className="parameter-field">
                <Label htmlFor="factor">
                  Combined margin <span>tCO₂/MWh</span>
                </Label>
                <Input
                  id="factor"
                  type="number"
                  min="0"
                  max="2"
                  step="0.001"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  required
                />
                <small>
                  Illustrative coefficient · applies to the demo emissions view.
                </small>
              </div>
              <div className="config-list">
                <div>
                  <span>Energy conversion</span>
                  <code>1 PJ = 1,000 TJ</code>
                </div>
                <div>
                  <span>Oil equivalent</span>
                  <code>1 ktoe = 0.041868 PJ</code>
                </div>
                <div>
                  <span>Historical check</span>
                  <Badge variant="secondary">±20% demo baseline</Badge>
                </div>
              </div>
              <Button className="mt-5" type="submit">
                <Check />
                Save demo parameter
              </Button>
            </form>
          </Panel>
          <Panel
            title="Security & operations"
            description="Production controls specified in the tender"
            action={<ShieldCheck className="size-5 text-primary" />}
          >
            <div className="ops-list">
              {[
                {
                  icon: LockKeyhole,
                  title: "Authentication & permissions",
                  text: "Administrator MFA · organisation-scoped RBAC",
                },
                {
                  icon: Database,
                  title: "Backup & recovery",
                  text: "Scheduled backups and tested restoration",
                },
                {
                  icon: History,
                  title: "Historical & audit retention",
                  text: "30+ years online · audit logs for at least 5 years",
                },
                {
                  icon: ArrowLeftRight,
                  title: "Future interoperability",
                  text: "Energy benchmarking and dispatch platform APIs",
                },
              ].map((o) => (
                <div key={o.title}>
                  <span>
                    <o.icon />
                  </span>
                  <div>
                    <b>{o.title}</b>
                    <p>{o.text}</p>
                  </div>
                  <Badge variant="outline">Planned</Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        {renderAuditTrail()}
      </>
    );
  }
  const heading =
    page === "overview" ? "The energy behind our nation." : current.label;
  const descriptions: Record<string, string> = {
    overview:
      "Explore the supply, transformation and use of energy across Sri Lanka.",
    balance: "Follow energy from its source to the sectors that depend on it.",
    buildings:
      "Measure building performance and support energy efficiency reporting.",
    emissions: "Trace the factors that connect energy use and emissions.",
    submissions:
      "A structured workspace for accurate and auditable energy data.",
    review: "Validate submissions and keep every decision traceable.",
    reports: "Turn energy data into useful, shareable evidence.",
    admin: "Manage calculation rules, metadata and governance.",
  };
  return (
    <>
      <div className="app-shell" data-app-shell>
        <aside className="desktop-sidebar">{renderSidebar()}</aside>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="mobile-sidebar">
            <SheetTitle className="sr-only">
              Energy portal navigation
            </SheetTitle>
            <SheetDescription className="sr-only">
              Explore analytics and workspace screens.
            </SheetDescription>
            {renderSidebar()}
          </SheetContent>
        </Sheet>
        <div className="app-main">
          <header className="topbar">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                className="mobile-trigger"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
              >
                <Menu />
              </Button>
              <div className="breadcrumb">
                National Energy Portal
                <ChevronRight />
                <span>{current.label}</span>
              </div>
            </div>
            <div className="topbar-actions">
              <Badge variant="outline" className="demo-badge">
                <span />
                ILLUSTRATIVE DATA
              </Badge>
              <SelectField
                label="Preview as"
                value={role}
                options={[
                  "Viewer",
                  "Data Provider",
                  "Verifier",
                  "Administrator",
                ]}
                onChange={(v) => setRole(v as Role)}
              />
              <Separator orientation="vertical" className="h-5!" />
              <ThemeButton />
              <span className="avatar">SL</span>
            </div>
          </header>
          <main>
            <div className="page-heading">
              <div>
                <p className="eyebrow">
                  SRI LANKA SUSTAINABLE ENERGY AUTHORITY
                </p>
                <h1>{heading}</h1>
                <p>{config?.description || descriptions[page]}</p>
              </div>
              <Button onClick={exportData}>
                <Download />
                Export data
              </Button>
            </div>
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                search();
              }}
            >
              <Search />
              <Input
                ref={searchRef}
                aria-label="Search energy data"
                placeholder="Explore with a question, e.g. “Compare electricity in 2022 and 2024”"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd>
                <Command />K
              </kbd>
              <Button size="sm" variant="secondary">
                Explore
                <ArrowUpRight />
              </Button>
            </form>
            {searchMessage && (
              <div className="search-result">
                <Sparkles />
                <span>{searchMessage}</span>
                <button
                  onClick={() => setSearchMessage("")}
                  aria-label="Dismiss search message"
                >
                  <X />
                </button>
              </div>
            )}
            <div className="filter-bar">
              <span>
                <SlidersHorizontal />
                Refine your view
              </span>
              <SelectField
                label="Reporting year"
                value={filters.year}
                options={years}
                onChange={(v) => changeFilter("year", v)}
              />
              <SelectField
                label="Energy source"
                value={filters.source}
                options={["All sources", ...sources]}
                onChange={(v) => changeFilter("source", v)}
              />
              <SelectField
                label="Sector"
                value={filters.sector}
                options={["All sectors", ...sectors]}
                onChange={(v) => changeFilter("sector", v)}
              />
              <SelectField
                label="Unit"
                value={filters.unit}
                options={["PJ", "ktoe", "GWh", "TJ"]}
                onChange={(v) => changeFilter("unit", v)}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Reset filters"
                    onClick={() => setFilters(initialFilters)}
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset filters</TooltipContent>
              </Tooltip>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={page}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -5 }}
                transition={{ duration: 0.22 }}
                className="page-content"
              >
                {page === "overview"
                  ? renderOverview({})
                  : page === "balance"
                    ? renderOverview({ balance: true })
                    : config
                      ? renderSectorModule()
                      : page === "buildings"
                        ? renderBuildings()
                        : page === "emissions"
                          ? renderEmissions()
                          : page === "submissions"
                            ? renderSubmissions()
                            : page === "review"
                              ? renderReview()
                              : page === "reports"
                                ? renderReports()
                                : renderAdmin()}
              </motion.div>
            </AnimatePresence>
            <footer className="page-footer">
              <span>
                Sri Lanka Sustainable Energy Authority <i /> Energy Balance
                Dashboard
              </span>
              <span>
                Concept prototype · Synthetic data · Built with Next.js
              </span>
            </footer>
          </main>
        </div>
      </div>
      <Dialog open={methodOpen} onOpenChange={setMethodOpen}>
        <DialogContent className="method-dialog">
          <DialogHeader>
            <DialogTitle>Transparent by design.</DialogTitle>
            <DialogDescription>
              Calculation methods, assumptions and provenance
            </DialogDescription>
          </DialogHeader>
          <div className="method-content">
            <Badge variant="secondary">
              <Info />
              Synthetic demonstration data
            </Badge>
            <p>
              No official SLSEA Energy Balance dataset was supplied. All numbers
              demonstrate the required user journeys.
            </p>
            <h3>Energy aggregation</h3>
            <p>
              A source-by-sector matrix aggregates selected cells. Annual
              multipliers illustrate 2020–2024. Renewable share includes
              biomass, hydro, solar and wind within the selected final
              consumption.
            </p>
            <div className="formula-chips">
              <code>1 PJ = 1,000 TJ</code>
              <code>1 GWh = 0.0036 PJ</code>
              <code>1 ktoe = 0.041868 PJ</code>
            </div>
            <h3>Forecast and emissions</h3>
            <p>
              The one-year projection extends the slope between the first and
              last synthetic annual observations. The default combined margin
              uses equal weights of illustrative operating (0.710) and build
              (0.330) margins, giving 0.520 tCO₂/MWh. Administrator changes
              override this example.
            </p>
            <h3>Production validation</h3>
            <p>
              Approved formulas, historical data, densities, exchange rates,
              sources and parameter versions must be supplied and validated with
              SLSEA. Reference: ToR §2.3 and Annex 1 §§3 and 6.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <SubmissionDialog
        open={entryOpen}
        setOpen={setEntryOpen}
        editing={editing}
        role={role}
        onSave={(record) => {
          setSubmissions((s) =>
            editing
              ? s.map((r) => (r.id === editing.id ? record : r))
              : [record, ...s],
          );
          emitAudit(`${record.status}: ${record.id}`, record.version);
          toast.success(
            record.status === "Draft"
              ? "Draft saved"
              : "Submission routed for verification",
          );
          setEntryOpen(false);
        }}
      />
      <Dialog open={!!reviewing} onOpenChange={(v) => !v && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review {reviewing?.id}</DialogTitle>
            <DialogDescription>
              Record an auditable decision on this demo submission.
            </DialogDescription>
          </DialogHeader>
          {reviewing && (
            <>
              <div className="review-summary">
                <span className="review-icon">
                  <FileSpreadsheet />
                </span>
                <div>
                  <h3>{reviewing.dataset}</h3>
                  <p>
                    {reviewing.org} · {reviewing.period} · v{reviewing.version}
                  </p>
                  <b>
                    {format(reviewing.value)} <small>{reviewing.unit}</small>
                  </b>
                </div>
              </div>
              <Notice icon={CheckCircle2}>
                Required fields present · Non-negative value · Demo quality
                checks passed.
              </Notice>
              <div className="space-y-2">
                <Label htmlFor="review-note">Review comment</Label>
                <Textarea
                  id="review-note"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain any correction or rejection…"
                />
              </div>
              <DialogFooter className="flex-wrap">
                <Button variant="outline" onClick={() => decide("Rejected")}>
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => decide("Revision requested")}
                >
                  Request revision
                </Button>
                <Button onClick={() => decide("Approved")}>
                  <Check />
                  Approve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="report-dialog">
          <DialogHeader>
            <DialogTitle>Energy report · {filters.year}</DialogTitle>
            <DialogDescription>
              Selected overview components · Synthetic demonstration data
            </DialogDescription>
          </DialogHeader>
          <ReportBody />
          <DialogFooter>
            <Button variant="outline" onClick={exportData}>
              <Download />
              CSV
            </Button>
            <Button onClick={() => window.print()}>
              <Printer />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
  function decide(decision: Submission["status"]) {
    if (!reviewing) return;
    try {
      const updated = reviewRecord(reviewing, decision, comment, role);
      setSubmissions((s) => s.map((r) => (r.id === updated.id ? updated : r)));
      emitAudit(
        `${decision}: ${updated.id}${comment ? " · " + comment : ""}`,
        updated.version,
      );
      setReviewing(null);
      toast.success("Review decision recorded");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }
  function ReportBody() {
    return (
      <div className="report-body">
        <div className="report-meta">
          <span>SLSEA ENERGY BALANCE · CONCEPT</span>
          <h2>Energy insights, {filters.year}</h2>
          <p>
            {filters.source} · {filters.sector} · {filters.unit}
            <br />
            Generated {dateFormat(new Date(), "dd MMM yyyy")} · Synthetic data,
            not an official publication.
          </p>
        </div>
        {reportSections.includes("summary") && (
          <div className="report-highlight">
            <span>Final energy consumption</span>
            <b>
              {energy(sum, filters.unit)} <small>{filters.unit}</small>
            </b>
          </div>
        )}
        {reportSections.includes("flow") && (
          <section>
            <h3>Energy flow</h3>
            <FlowChart filters={filters} />
          </section>
        )}
        {reportSections.includes("mix") && (
          <section>
            <h3>Source composition</h3>
            <MixChart data={convertRows(sourceRows)} unit={filters.unit} />
          </section>
        )}
        {reportSections.includes("table") && (
          <section>
            <h3>Source comparison</h3>
            <EnergyTable
              data={convertRows(sourceRows)}
              unit={filters.unit}
              year={filters.year}
              compare={compare}
            />
          </section>
        )}
        <p className="report-citation">
          Source: Synthetic demonstration dataset. Concept based on tender
          10055844, ToR and Annex 1. All official statistics and methodologies
          require SLSEA approval.
        </p>
      </div>
    );
  }
}
function AccessState({
  icon: Icon,
  title,
  text,
  action,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="access-state"
    >
      <span>
        <Icon />
      </span>
      <Badge variant="outline">ROLE PREVIEW</Badge>
      <h2>{title}</h2>
      <p>{text}</p>
      <Button onClick={action}>
        {actionLabel}
        <ArrowRight />
      </Button>
      <small>
        <ShieldCheck />
        Demonstration only · No production access is granted
      </small>
    </motion.div>
  );
}
const entrySchema = z.object({
  dataset: z.string().min(1),
  year: z.string().min(4),
  frequency: z.string().min(1),
  value: z
    .number({ invalid_type_error: "Enter a numeric value." })
    .min(0, "Consumption cannot be negative."),
  unit: z.enum(["GWh", "PJ", "TJ", "ktoe"]),
});
type Entry = z.infer<typeof entrySchema>;
function SubmissionDialog({
  open,
  setOpen,
  editing,
  role,
  onSave,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  editing: Submission | null;
  role: Role;
  onSave: (s: Submission) => void;
}) {
  const [frequencyPeriod, setFrequencyPeriod] = useState(""),
    [validation, setValidation] = useState(""),
    draftRef = useRef(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Entry>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      dataset: "Electricity generation",
      year: "2024",
      frequency: "Annual",
      value: 16200,
      unit: "GWh",
    },
  });
  useEffect(() => {
    if (open) {
      reset({
        dataset: editing?.dataset || "Electricity generation",
        year: editing?.period.slice(0, 4) || "2024",
        frequency: "Annual",
        value: editing?.value ?? 16200,
        unit: (editing?.unit as Unit) || "GWh",
      });
      setValidation("");
      setFrequencyPeriod("");
    }
  }, [open, editing, reset]);
  const frequency = watch("frequency");
  const submit = handleSubmit((data) => {
    if (!canSubmit(role)) {
      setValidation("Choose Data Provider or Administrator to submit.");
      return;
    }
    const draft = draftRef.current;
    if (!draft && frequency !== "Annual" && !frequencyPeriod.trim()) {
      setValidation(
        "Specify the reporting month, day, quarter or ad hoc period.",
      );
      return;
    }
    if (!draft && data.dataset === "Electricity generation") {
      const baseline = 16200 * 0.0036 * conversions[data.unit];
      if (Math.abs(data.value / baseline - 1) > 0.2) {
        setValidation(
          `Historical plausibility check: value differs by more than 20% from the demo baseline (${format(baseline)} ${data.unit}). Correct the value or save a draft.`,
        );
        return;
      }
    }
    onSave({
      id: editing?.id || `SUB-${Date.now().toString().slice(-7)}`,
      org: "CEB",
      dataset: data.dataset,
      period: `${data.year} · ${data.frequency}${frequencyPeriod ? " · " + frequencyPeriod : ""}`,
      value: data.value,
      unit: data.unit,
      status: draft ? "Draft" : "Awaiting review",
      version: editing ? editing.version + 1 : 1,
    });
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Revise" : "New"} energy submission
          </DialogTitle>
          <DialogDescription>
            CEB sample provider · Structured, validated data entry
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="submission-form">
          <div className="form-grid">
            <div>
              <Label>Organisation</Label>
              <Input value="CEB" disabled />
            </div>
            <div>
              <Label>Dataset</Label>
              <Select
                value={watch("dataset")}
                onValueChange={(v) => setValue("dataset", v)}
              >
                <SelectTrigger aria-label="Dataset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Electricity generation",
                    "Building energy",
                    "Petroleum imports",
                  ].map((n) => (
                    <SelectItem value={n} key={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reporting year</Label>
              <Select
                value={watch("year")}
                onValueChange={(v) => setValue("year", v)}
              >
                <SelectTrigger aria-label="Submission year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((n) => (
                    <SelectItem value={n} key={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(v) => {
                  setValue("frequency", v);
                  setFrequencyPeriod("");
                }}
              >
                <SelectTrigger aria-label="Reporting frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Annual", "Quarterly", "Monthly", "Daily", "Ad hoc"].map(
                    (n) => (
                      <SelectItem value={n} key={n}>
                        {n}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            {frequency !== "Annual" && (
              <div className="col-span-2">
                <Label htmlFor="report-period">Reporting period</Label>
                <Input
                  id="report-period"
                  value={frequencyPeriod}
                  onChange={(e) => setFrequencyPeriod(e.target.value)}
                  placeholder={
                    frequency === "Quarterly"
                      ? "e.g. Q2"
                      : frequency === "Monthly"
                        ? "e.g. June"
                        : frequency === "Daily"
                          ? "e.g. 2024-06-15"
                          : "Describe the reporting period"
                  }
                />
              </div>
            )}
            <div>
              <Label htmlFor="energy-value">Energy value</Label>
              <Input
                id="energy-value"
                type="number"
                step="any"
                {...register("value", { valueAsNumber: true })}
                aria-invalid={!!errors.value}
              />
              {errors.value && (
                <small className="field-error">{errors.value.message}</small>
              )}
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={watch("unit")}
                onValueChange={(v) => setValue("unit", v as Unit)}
              >
                <SelectTrigger aria-label="Submission unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["GWh", "PJ", "TJ", "ktoe"].map((n) => (
                    <SelectItem value={n} key={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {validation && (
            <div className="validation-error" role="alert">
              <AlertCircle />
              {validation}
            </div>
          )}
          <p className="section-note">
            Drafts and review events stay in this browser session. Production
            submission requires authenticated access and durable storage.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              type="submit"
              onClick={() => {
                draftRef.current = true;
              }}
            >
              Save draft
            </Button>
            <Button
              type="submit"
              onClick={() => {
                draftRef.current = false;
              }}
            >
              <ShieldCheck />
              Validate & submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
