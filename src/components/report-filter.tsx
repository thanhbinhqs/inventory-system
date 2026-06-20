"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  endOfDay,
  startOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { CalendarPopover } from "@/components/calendar-popover";

const presets = [
  { label: "Hôm nay", days: 0 },
  { label: "7 ngày", days: 6 },
  { label: "30 ngày", days: 29 },
  { label: "Năm nay", days: "year" as const },
] as const;

const periodModes = [
  { value: "day", label: "Theo ngày" },
  { value: "week", label: "Theo tuần" },
  { value: "month", label: "Theo tháng" },
  { value: "year", label: "Theo năm" },
] as const;

type PeriodMode = (typeof periodModes)[number]["value"];

function formatDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function ReportFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const mode = (searchParams.get("mode") as PeriodMode) || "day";

  const navigate = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, val]) => {
        if (val) sp.set(key, val);
        else sp.delete(key);
      });
      router.push(`/dashboard?${sp.toString()}`);
    },
    [searchParams, router],
  );

  const applyPreset = (preset: (typeof presets)[number]) => {
    const now = new Date();
    let fromDate: Date;
    let toDate: Date;

    if (preset.days === "year") {
      fromDate = startOfYear(now);
      toDate = endOfYear(now);
    } else if (preset.days === 0) {
      fromDate = startOfDay(now);
      toDate = endOfDay(now);
    } else {
      fromDate = startOfDay(subDays(now, preset.days));
      toDate = endOfDay(now);
    }

    navigate({ from: formatDate(fromDate), to: formatDate(toDate), mode: "day" });
  };

  const applyPeriod = (newMode: PeriodMode) => {
    const now = new Date();
    switch (newMode) {
      case "day":
        navigate({ mode: "day", from: formatDate(startOfDay(now)), to: formatDate(endOfDay(now)) });
        break;
      case "week": {
        const ws = startOfWeek(now, { weekStartsOn: 1 });
        const we = endOfWeek(now, { weekStartsOn: 1 });
        navigate({ mode: "week", from: formatDate(ws), to: formatDate(we) });
        break;
      }
      case "month": {
        const ms = startOfMonth(now);
        const me = endOfMonth(now);
        navigate({ mode: "month", from: formatDate(ms), to: formatDate(me) });
        break;
      }
      case "year": {
        navigate({ mode: "year", from: formatDate(startOfYear(now)), to: formatDate(endOfYear(now)) });
        break;
      }
    }
  };

  const isActive = (preset: (typeof presets)[number]) => {
    if (!from && !to) return preset.label === "30 ngày";
    const now = new Date();
    let fromDate: Date;
    let toDate: Date;
    if (preset.days === "year") {
      fromDate = startOfYear(now);
      toDate = endOfYear(now);
    } else if (preset.days === 0) {
      fromDate = startOfDay(now);
      toDate = endOfDay(now);
    } else {
      fromDate = startOfDay(subDays(now, preset.days));
      toDate = endOfDay(now);
    }
    return from === formatDate(fromDate) && to === formatDate(toDate);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset buttons */}
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant={isActive(preset) ? "default" : "outline"}
          size="sm"
          onClick={() => applyPreset(preset)}
          className="h-8 text-xs"
        >
          {preset.label}
        </Button>
      ))}

      {/* Separator */}
      <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

      {/* Period mode selector */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/50">
        {periodModes.map((pm) => (
          <button
            key={pm.value}
            onClick={() => applyPeriod(pm.value)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
              mode === pm.value
                ? "bg-background text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {pm.label}
          </button>
        ))}
      </div>

      {/* Date picker - unified popover calendar */}
      <div className="flex items-center gap-1.5">
        <CalendarPopover
          mode={mode}
          from={from || formatDate(startOfDay(subDays(new Date(), 29)))}
          to={to || formatDate(endOfDay(new Date()))}
          onRangeChange={(newFrom, newTo) =>
            navigate({ from: newFrom, to: newTo, mode })
          }
        />
      </div>
    </div>
  );
}
