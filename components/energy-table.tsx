"use client";
import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format, type Datum } from "@/lib/energy";
export function EnergyTable({
  data,
  unit,
  year,
  compare = "2023",
  firstLabel = "Energy source",
}: {
  data: Datum[];
  unit: string;
  year: string;
  compare?: string;
  firstLabel?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([
      { id: "value", desc: true },
    ]),
    [search, setSearch] = useState(""),
    [visibility, setVisibility] = useState<VisibilityState>({});
  const total = data.reduce((s, r) => s + r.value, 0);
  const columns = useMemo<ColumnDef<Datum>[]>(
    () => [
      {
        accessorKey: "name",
        header: firstLabel,
        cell: ({ row }) => (
          <span className="source-cell">
            <i style={{ "--token": row.original.color } as React.CSSProperties}>
              {row.original.name.slice(0, 1)}
            </i>
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "value",
        header: () => (
          <span>
            {year} <small>{unit}</small>
          </span>
        ),
        cell: ({ getValue }) => (
          <strong className="table-number">{format(getValue<number>())}</strong>
        ),
      },
      {
        accessorKey: "previous",
        header: () => (
          <span>
            {compare} <small>{unit}</small>
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="tabular-nums text-muted-foreground">
            {format(getValue<number>() || 0)}
          </span>
        ),
      },
      {
        id: "share",
        header: "Share of total",
        cell: ({ row }) => {
          const p = total ? (row.original.value / total) * 100 : 0;
          return (
            <span className="table-share">
              <span>
                <i style={{ width: `${p}%`, background: row.original.color }} />
              </span>
              {format(p)}%
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: () => (
          <Badge variant="secondary" className="status-badge">
            <i />
            Illustrative
          </Badge>
        ),
      },
    ],
    [unit, year, compare, firstLabel, total],
  );
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search, columnVisibility: visibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });
  const filtered = table.getFilteredRowModel().rows;
  return (
    <div className="energy-table">
      <div className="table-toolbar">
        <div className="table-search">
          <Search />
          <Input
            aria-label="Search table"
            placeholder="Find a category…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              table.setPageIndex(0);
            }}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllLeafColumns()
              .filter((c) => c.id !== "name")
              .map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={c.getIsVisible()}
                  onCheckedChange={(v) => c.toggleVisibility(v)}
                >
                  {
                    (
                      {
                        value: year,
                        previous: compare,
                        share: "Share of total",
                        status: "Data status",
                      } as Record<string, string>
                    )[c.id]
                  }
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="table-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((g) => (
              <TableRow key={g.id}>
                {g.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={
                      ["value", "previous"].includes(h.column.id)
                        ? "text-right"
                        : ""
                    }
                  >
                    {h.isPlaceholder ? null : h.column.getCanSort() ? (
                      <button
                        className="table-sort"
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <ArrowDownUp />
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((r) => (
                <TableRow key={r.id}>
                  {r.getVisibleCells().map((c) => (
                    <TableCell
                      key={c.id}
                      className={
                        ["value", "previous"].includes(c.column.id)
                          ? "text-right"
                          : ""
                      }
                    >
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  No matching categories.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              {table.getVisibleLeafColumns().map((c) => (
                <TableCell
                  key={c.id}
                  className={
                    ["value", "previous"].includes(c.id) ? "text-right" : ""
                  }
                >
                  {c.id === "name"
                    ? "Filtered total"
                    : c.id === "value"
                      ? format(
                          filtered.reduce((s, r) => s + r.original.value, 0),
                        )
                      : c.id === "previous"
                        ? format(
                            filtered.reduce(
                              (s, r) => s + (r.original.previous || 0),
                              0,
                            ),
                          )
                        : c.id === "share"
                          ? (total
                              ? format(
                                  (filtered.reduce(
                                    (s, r) => s + r.original.value,
                                    0,
                                  ) /
                                    total) *
                                    100,
                                )
                              : "0") + "%"
                          : ""}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div className="table-bottom">
        <span>
          <i className="live-dot" />
          {filtered.length} of {data.length} categories · Synthetic data
        </span>
        <div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous table page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft />
          </Button>
          <span>
            {table.getState().pagination.pageIndex + 1} /{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next table page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
