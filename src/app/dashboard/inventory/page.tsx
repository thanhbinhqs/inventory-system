import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { InventoryContent } from "./content";
import { NewTransactionDialog } from "@/components/new-transaction";
import { resolveFilterParams } from "@/lib/url";
import type { TransactionFilter } from "@/lib/types";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("name");
  return data ?? [];
}

async function getTransactions(filter: TransactionFilter) {
  const supabase = await createClient();

  let query = supabase
    .from("inventory_transactions")
    .select("*, product:products(*)", { count: "exact" });

  // Filter by search (product name via foreign key)
  if (filter.search) {
    // Query matching product IDs first, then filter transactions
    const { data: matchingProducts } = await supabase
      .from("products")
      .select("id")
      .ilike("name", `%${filter.search}%`);
    
    const productIds = matchingProducts?.map((p) => p.id) ?? [];
    if (productIds.length > 0) {
      query = query.in("product_id", productIds);
    } else {
      // No matching products, return empty result
      query = query.eq("product_id", "00000000-0000-0000-0000-000000000000");
    }
  }

  // Filter by type
  if (filter.type === "IN" || filter.type === "OUT") {
    query = query.eq("type", filter.type);
  }

  // Filter by date range
  if (filter.startDate) {
    query = query.gte("transaction_date", filter.startDate);
  }
  if (filter.endDate) {
    query = query.lte("transaction_date", filter.endDate);
  }

  // Sorting
  const sortField = filter.sortBy === "product.name"
    ? "products.name"
    : filter.sortBy;

  // For foreign table sorting, we need a different approach
  if (filter.sortBy === "product.name") {
    query = query.order("products(name)", {
      ascending: filter.sortOrder === "asc",
    });
  } else {
    query = query.order(sortField, {
      ascending: filter.sortOrder === "asc",
    });
  }

  // Pagination
  const from = (filter.page - 1) * filter.pageSize;
  const to = from + filter.pageSize - 1;
  query = query.range(from, to);

  const { data, count } = await query;

  return {
    data: data ?? [],
    total: count ?? 0,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages: Math.ceil((count ?? 0) / filter.pageSize),
  };
}

async function InventoryTable({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(sp)) {
    if (Array.isArray(val)) val.forEach((v) => params.append(key, v));
    else if (val !== undefined) params.set(key, val);
  }

  const paramsStr = params.toString();
  const filter = resolveFilterParams(params);
  const [transactions, products] = await Promise.all([
    getTransactions(filter),
    getProducts(),
  ]);

  return (
    <>
      <Header
        title="Kho hàng"
        description="Quản lý nhập xuất tồn kho"
        actions={<NewTransactionDialog products={products} />}
      />
      <div className="flex-1 p-6 space-y-4">
        <InventoryContent
          key={paramsStr}
          initialData={transactions}
          initialParams={paramsStr}
          products={products}
        />
      </div>
    </>
  );
}

export default function InventoryPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <>
          <Header title="Kho hàng" description="Đang tải dữ liệu..." />
          <div className="flex-1 p-6 space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded-xl w-full" />
              <div className="h-[400px] bg-muted rounded-xl w-full" />
            </div>
          </div>
        </>
      }
    >
      <InventoryTable searchParams={props.searchParams} />
    </Suspense>
  );
}
