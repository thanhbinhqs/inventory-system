"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

type SelectionMode = "day" | "week" | "month" | "year";

interface CalendarPopoverProps {
  mode: SelectionMode;
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
}

// Tailwind-based classNames for react-day-picker
const classNames = {
  root: "rdp-root p-2",
  months: "rdp-months relative",
  month_caption: "rdp-caption text-sm font-semibold text-center mb-2",
  month_grid: "rdp-monthgrid",
  weekday: "rdp-weekday text-xs text-muted-foreground pt-1 pb-1 font-normal",
  day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
  day_button:
    "h-9 w-9 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary aria-selected:hover:text-primary-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground",
  selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
  today: "font-bold",
  outside: "text-muted-foreground opacity-50",
  disabled: "text-muted-foreground opacity-50",
  range_start: "rounded-l-md bg-primary text-primary-foreground",
  range_end: "rounded-r-md bg-primary text-primary-foreground",
  range_middle: "bg-primary/10 text-foreground",
  chevron: "h-4 w-4",
  nav: "flex items-center absolute inset-x-0 top-0 justify-between pointer-events-none",
  nav_button: "pointer-events-auto p-1.5 rounded-md hover:bg-muted transition-colors",
  weekday_grid: "rdp-weekdaygrid grid grid-cols-7",
  weekdays: "rdp-weekdays",
};

const yearsList = Array.from({ length: 15 }, (_, i) => 2020 + i);

export function CalendarPopover({
  mode,
  from,
  to,
  onRangeChange,
}: CalendarPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse from/to strings
  const initialFrom = from ? new Date(from + "T00:00:00") : undefined;
  const initialTo = to ? new Date(to + "T00:00:00") : undefined;

  // Day mode: range state
  const [range, setRange] = useState<DateRange | undefined>(
    mode === "day" && initialFrom
      ? { from: initialFrom, to: initialTo || initialFrom }
      : undefined,
  );
  // Week/month mode: single selected day
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    mode === "week" || mode === "month"
      ? initialFrom
      : undefined,
  );
  // Year mode
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    mode === "year" && initialFrom
      ? initialFrom.getFullYear()
      : undefined,
  );

  const displayLabel = (() => {
    if (!from || !to) return "Chọn khoảng thời gian";
    const parsedFrom = new Date(from + "T00:00:00");
    const parsedTo = new Date(to + "T00:00:00");
    switch (mode) {
      case "day":
        if (from === to) return format(parsedFrom, "dd/MM/yyyy");
        return `${format(parsedFrom, "dd/MM/yyyy")} - ${format(parsedTo, "dd/MM/yyyy")}`;
      case "week":
        return `Tuần ${format(parsedFrom, "w")}, ${format(parsedFrom, "dd/MM")} - ${format(parsedTo, "dd/MM/yyyy")}`;
      case "month":
        return `Tháng ${format(parsedFrom, "M/yyyy")}`;
      case "year":
        return `Năm ${format(parsedFrom, "yyyy")}`;
    }
  })();

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Sync state when mode changes
  useEffect(() => {
    if (mode === "day") {
      setRange(
        initialFrom ? { from: initialFrom, to: initialTo || initialFrom } : undefined,
      );
    } else if (mode === "week" || mode === "month") {
      setSelectedDay(initialFrom);
    } else if (mode === "year") {
      setSelectedYear(initialFrom ? initialFrom.getFullYear() : undefined);
    }
  }, [mode]);

  const handleDaySelect = useCallback(
    (selected: DateRange | undefined) => {
      setRange(selected);
      if (selected?.from && selected?.to) {
        onRangeChange(
          format(startOfDay(selected.from), "yyyy-MM-dd"),
          format(endOfDay(selected.to), "yyyy-MM-dd"),
        );
        setOpen(false);
      } else if (selected?.from && !selected?.to) {
        // Single day in range mode
        onRangeChange(
          format(startOfDay(selected.from), "yyyy-MM-dd"),
          format(endOfDay(selected.from), "yyyy-MM-dd"),
        );
        setOpen(false);
      }
    },
    [onRangeChange],
  );

  const handleWeekSelect = useCallback(
    (day: Date | undefined) => {
      if (!day) return;
      const ws = startOfWeek(day, { weekStartsOn: 1 });
      const we = endOfWeek(day, { weekStartsOn: 1 });
      onRangeChange(
        format(ws, "yyyy-MM-dd"),
        format(we, "yyyy-MM-dd"),
      );
      setSelectedDay(day);
      setOpen(false);
    },
    [onRangeChange],
  );

  const handleMonthSelect = useCallback(
    (day: Date | undefined) => {
      if (!day) return;
      const ms = startOfMonth(day);
      const me = endOfMonth(day);
      onRangeChange(
        format(ms, "yyyy-MM-dd"),
        format(me, "yyyy-MM-dd"),
      );
      setSelectedDay(day);
      setOpen(false);
    },
    [onRangeChange],
  );

  const handleYearSelect = useCallback(
    (year: number) => {
      const ys = startOfYear(new Date(year, 0));
      const ye = endOfYear(new Date(year, 0));
      onRangeChange(
        format(ys, "yyyy-MM-dd"),
        format(ye, "yyyy-MM-dd"),
      );
      setSelectedYear(year);
      setOpen(false);
    },
    [onRangeChange],
  );

  const handleButtonClick = () => {
    // Reset state for the current mode when opening
    if (!open) {
      if (mode === "day") {
        setRange(
          initialFrom
            ? { from: initialFrom, to: initialTo || initialFrom }
            : undefined,
        );
      }
    }
    setOpen(!open);
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleButtonClick}
        className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring flex items-center gap-1.5 whitespace-nowrap hover:bg-accent/50 transition-colors"
      >
        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span>{displayLabel}</span>
        <svg
          className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute bottom-full left-0 mb-1 z-50 bg-popover rounded-lg shadow-lg ring-1 ring-foreground/10 border border-border p-1 min-w-[280px]"
        >
          {mode === "day" && (
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleDaySelect}
              locale={vi}
              classNames={classNames}
              startMonth={new Date(2020, 0)}
              endMonth={new Date(2030, 11)}
            />
          )}
          {mode === "week" && (
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={handleWeekSelect}
              locale={vi}
              classNames={classNames}
              startMonth={new Date(2020, 0)}
              endMonth={new Date(2030, 11)}
            />
          )}
          {mode === "month" && (
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={handleMonthSelect}
              locale={vi}
              classNames={classNames}
              startMonth={new Date(2020, 0)}
              endMonth={new Date(2030, 11)}
            />
          )}
          {mode === "year" && (
            <div className="p-2">
              <p className="text-sm font-semibold text-center mb-3">
                Chọn năm
              </p>
              <div className="grid grid-cols-3 gap-2">
                {yearsList.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`h-10 rounded-md text-sm font-medium transition-colors ${
                      selectedYear === year
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground text-foreground"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
