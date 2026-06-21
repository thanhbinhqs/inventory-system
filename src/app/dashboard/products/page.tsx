import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { ProductsContent } from "./content";

const PAGE_SIZE = 25;

async function getProducts(searchParams: Promise<{ [key: string]: string | string[] | undefined }>) {
  const params = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, parseInt(params?.page as string) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("name")
    .range(from, to);

  return {
    products: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  };
}

async function ProductsTable({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { products, total, page, totalPages } = await getProducts(searchParams);

  return (
    <>
      <Header
        title="Sản phẩm"
        description="Quản lý sản phẩm: thêm, sửa, xóa, nhập kho"
      />
      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <ProductsContent
          products={products}
          total={total}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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
      <ProductsTable searchParams={searchParams} />
    </Suspense>
  );
}
