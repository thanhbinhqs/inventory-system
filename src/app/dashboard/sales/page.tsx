import { Suspense } from "react";
import { Header } from "@/components/header";
import { SalesContent } from "./content";

export default function SalesPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header title="Bán hàng" description="Đang tải..." />
          <div className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded-xl w-full" />
              <div className="h-[400px] bg-muted rounded-xl w-full" />
            </div>
          </div>
        </>
      }
    >
      <SalesPageInner />
    </Suspense>
  );
}

async function SalesPageInner() {
  return (
    <>
      <Header
        title="Bán hàng"
        description="Quét barcode hoặc tìm kiếm sản phẩm để tạo đơn bán"
      />
      <div className="flex-1 p-6">
        <SalesContent />
      </div>
    </>
  );
}
