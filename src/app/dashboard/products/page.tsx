import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { ProductsContent } from "./content";

async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("name");
  return data ?? [];
}

async function ProductsTable() {
  const products = await getProducts();

  return (
    <>
      <Header
        title="Sản phẩm"
        description="Quản lý sản phẩm: thêm, sửa, xóa, nhập kho"
      />
      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <ProductsContent products={products} />
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header title="Sản phẩm" description="Đang tải dữ liệu..." />
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-10 bg-muted rounded-xl w-full shrink-0" />
              <div className="flex-1 bg-muted rounded-xl w-full" />
            </div>
          </div>
        </>
      }
    >
      <ProductsTable />
    </Suspense>
  );
}
