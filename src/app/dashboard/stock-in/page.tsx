import { Suspense } from "react";
import { Header } from "@/components/header";
import { StockInContent } from "./content";

export default function StockInPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header title="Nhập kho" description="Đang tải dữ liệu..." />
          <div className="flex-1 p-6 space-y-4">
            <div className="animate-pulse">
              <div className="h-12 bg-muted rounded-xl w-full" />
            </div>
          </div>
        </>
      }
    >
      <StockInPageInner />
    </Suspense>
  );
}

async function StockInPageInner() {
  return (
    <>
      <Header
        title="Nhập kho"
        description="Tìm kiếm sản phẩm và nhập số lượng để thêm hàng vào kho"
      />
      <div className="flex-1 p-6 space-y-4">
        <StockInContent />
      </div>
    </>
  );
}
