"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { FilterBar } from "./filter-bar";
import { NewTransactionDialog } from "@/components/new-transaction";
import type { PaginatedResult, InventoryTransaction, Product } from "@/lib/types";

interface InventoryContentProps {
  initialData: PaginatedResult<InventoryTransaction>;
  initialParams: string;
  products: Product[];
}

export function InventoryContent({
  initialData,
  initialParams,
  products,
}: InventoryContentProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const currentParams = useMemo(() => new URLSearchParams(initialParams), [initialParams]);

  // Sync data when server re-renders with new search params
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(currentParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      const qs = params.toString();
      router.push(`/dashboard/inventory${qs ? `?${qs}` : ""}`);
    },
    [router, currentParams],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar currentParams={currentParams} />
        <NewTransactionDialog products={products} />
      </div>
      <DataTable
        columns={columns}
        data={data.data}
        total={data.total}
        page={data.page}
        pageSize={data.pageSize}
        onPageChange={handlePageChange}
        scrollable
      />
    </div>
  );
}
