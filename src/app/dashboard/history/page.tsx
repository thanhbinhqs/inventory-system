import { Suspense } from "react";
import { Header } from "@/components/header";
import { HistoryContent } from "./content";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAGE_SIZE = 20;

async function getData(page: number) {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { count } = await supabase
    .from("inventory_transactions")
    .select("*", { count: "exact", head: true })
    .eq("type", "OUT");

  const { data } = await supabase
    .from("inventory_transactions")
    .select("*, product:products(name, sku, barcode)")
    .eq("type", "OUT")
    .order("transaction_date", { ascending: false })
    .range(from, to);

  return {
    data: data ?? [],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  };
}

async function HistoryTable({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) ?? "1", 10) || 1);
  const { data, total, totalPages } = await getData(page);

  return (
    <>
      <Header
        title="Lịch sử bán hàng"
        description="Tổng quan các giao dịch đã thanh toán"
      />
      <div className="flex-1 p-6 space-y-4">
        <HistoryContent
          data={data}
          total={total}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}

export default function HistoryPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <>
          <Header title="Lịch sử bán hàng" description="Đang tải dữ liệu..." />
          <div className="flex-1 p-6 space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded-xl w-full" />
              <div className="h-[400px] bg-muted rounded-xl w-full" />
            </div>
          </div>
        </>
      }
    >
      <HistoryTable searchParams={props.searchParams} />
    </Suspense>
  );
}
