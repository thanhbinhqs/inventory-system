"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart, History } from "lucide-react";
import { useRouter } from "next/navigation";

type SaleRecord = {
  id: string;
  product_id: string;
  type: "IN" | "OUT";
  quantity: number;
  price: number;
  transaction_date: string;
  note: string | null;
  created_at: string;
  product: { name: string; sku: string; barcode: string | null } | null;
};

export function HistoryContent({
  data,
  total,
  page,
  totalPages,
}: {
  data: SaleRecord[];
  total: number;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`/dashboard/history?page=${newPage}`);
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <History className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">Chưa có giao dịch bán hàng</p>
        <p className="text-xs mt-1">Các giao dịch thanh toán sẽ xuất hiện tại đây</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Summary bar */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
        <ShoppingCart className="w-4 h-4" />
        <span>
          Tổng số: <strong className="text-foreground">{total}</strong> giao dịch bán
        </span>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 min-h-0 rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                  Thời gian
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                  Sản phẩm
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                  SKU / Barcode
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                  SL
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                  Đơn giá
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                  Thành tiền
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-3 text-sm whitespace-nowrap">
                    {formatDate(tx.transaction_date)}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium">
                    {tx.product?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                    {tx.product?.sku ?? "—"}
                    {tx.product?.barcode && <> | {tx.product.barcode}</>}
                  </td>
                  <td className="px-5 py-3 text-sm text-right font-mono">
                    {tx.quantity}
                  </td>
                  <td className="px-5 py-3 text-sm text-right font-mono">
                    {formatCurrency(tx.price)}
                  </td>
                  <td className="px-5 py-3 text-sm text-right font-semibold font-mono">
                    {formatCurrency(tx.quantity * tx.price)}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {tx.note ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
