"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";

interface FilterBarProps {
  currentParams: URLSearchParams;
}

export function FilterBar({ currentParams }: FilterBarProps) {
  const router = useRouter();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const updateUrlParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(currentParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Reset to page 1 when filter changes
      if (key !== "page") {
        params.delete("page");
      }
      const qs = params.toString();
      router.push(`/dashboard/inventory${qs ? `?${qs}` : ""}`);
    },
    [router, currentParams],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        updateUrlParam("search", value || null);
      }, 300);
    },
    [updateUrlParam],
  );

  const handleTypeFilter = useCallback(
    (value: string | null) => {
      updateUrlParam("type", !value || value === "ALL" ? null : value);
    },
    [updateUrlParam],
  );

  const handleReset = useCallback(() => {
    router.push("/dashboard/inventory");
  }, [router]);

  const currentSearch = currentParams.get("search") ?? "";
  const currentType = currentParams.get("type") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          defaultValue={currentSearch}
          onChange={handleSearchChange}
          className="pl-9 h-9"
        />
      </div>

      {/* Type filter */}
      <Select value={currentType || "ALL"} onValueChange={handleTypeFilter}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Loại" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả</SelectItem>
          <SelectItem value="IN">Nhập kho</SelectItem>
          <SelectItem value="OUT">Xuất kho</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="h-9 gap-1"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Đặt lại
      </Button>
    </div>
  );
}
