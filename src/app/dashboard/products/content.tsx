"use client";

import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Package,
  Plus,
  Pencil,
  Trash2,
  ArrowDownToLine,
  Barcode,
  Hash,
  DollarSign,
  Tag,
  AlertTriangle,
  CircleCheckBig,
  Layers,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/product";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ProductsContentProps {
  products: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <Package className="w-12 h-12 mb-4 opacity-50" />
      <p className="mb-4">Chưa có sản phẩm nào</p>
    </div>
  );
}

// ---------- Add/Edit Product Dialog ----------
function ProductFormDialog({
  product,
  open,
  onOpenChange,
}: {
  product?: Product | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!product;
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit && product) {
        formData.set("id", product.id);
        const result = await updateProduct(formData);
        if (result?.error) toast.error(result.error);
        else {
          toast.success("Cập nhật sản phẩm thành công!");
          onOpenChange(false);
          router.refresh();
        }
      } else {
        const result = await createProduct(formData);
        if (result?.error) toast.error(result.error);
        else {
          toast.success("Thêm sản phẩm thành công!");
          onOpenChange(false);
          router.refresh();
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              {isEdit ? (
                <Pencil className="w-5 h-5 text-primary" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}
              </DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                {isEdit
                  ? "Cập nhật thông tin sản phẩm"
                  : "Nhập thông tin sản phẩm mới vào hệ thống"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-5 pt-2">
          {/* Section: Thông tin cơ bản */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <Layers className="w-3.5 h-3.5" />
              Thông tin cơ bản
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  Mã SKU
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  required
                  defaultValue={product?.sku ?? ""}
                  placeholder="VD: SP006"
                  className="h-10 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-sm font-medium flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-muted-foreground" />
                  Barcode
                </Label>
                <Input
                  id="barcode"
                  name="barcode"
                  defaultValue={(product as any)?.barcode ?? ""}
                  placeholder="Mã vạch (không bắt buộc)"
                  className="h-10 font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                Tên sản phẩm
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={product?.name ?? ""}
                placeholder="Nhập tên sản phẩm"
                className="h-10"
              />
            </div>
          </div>

          <Separator />

          {/* Section: Giá & Tồn kho */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <DollarSign className="w-3.5 h-3.5" />
              Giá & Tồn kho
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price" className="text-sm font-medium flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-muted-foreground" />
                  Giá vốn
                </Label>
                <div className="relative">
                  <Input
                    id="cost_price"
                    name="cost_price"
                    type="number"
                    min="0"
                    step="1000"
                    required
                    defaultValue={product?.cost_price ?? 0}
                    className="h-10 pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₫</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling_price" className="text-sm font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                  Giá bán
                </Label>
                <div className="relative">
                  <Input
                    id="selling_price"
                    name="selling_price"
                    type="number"
                    min="0"
                    step="1000"
                    required
                    defaultValue={product?.selling_price ?? 0}
                    className="h-10 pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₫</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock" className="text-sm font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                Tồn tối thiểu
              </Label>
              <Input
                id="min_stock"
                name="min_stock"
                type="number"
                min="0"
                defaultValue={product?.min_stock ?? 0}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Cảnh báo khi tồn kho dưới mức này
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : isEdit ? (
                <>
                  <CircleCheckBig className="w-4 h-4" />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Thêm sản phẩm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Pagination ----------
function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-2 flex-shrink-0">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
        className="gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Trước
      </Button>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        Trang {currentPage} / {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => goTo(currentPage + 1)}
        className="gap-1"
      >
        Sau
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ---------- Main Content ----------
export function ProductsContent({
  products,
  total,
  currentPage,
  totalPages,
}: ProductsContentProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  async function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Đã xóa sản phẩm");
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm trong trang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Table area */}
      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex-1 min-h-0 rounded-xl border border-border bg-card overflow-hidden">
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="w-[50px]">STT</TableHead>
                    <TableHead>Mã SP</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead className="text-right">Giá vốn</TableHead>
                    <TableHead className="text-right">Giá bán</TableHead>
                    <TableHead className="text-right">Tồn tối thiểu</TableHead>
                    <TableHead className="w-[160px] text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((product, i) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {(currentPage - 1) * 25 + i + 1}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {product.sku}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(product.cost_price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(product.selling_price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <Badge
                          variant={product.min_stock > 0 ? "outline" : "secondary"}
                          className="font-mono"
                        >
                          {product.min_stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                            onClick={() => router.push("/dashboard/stock-in")}
                            title="Nhập kho"
                          >
                            <ArrowDownToLine className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditProduct(product)}
                            title="Sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => setDeleteTarget(product)}
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-muted-foreground">
              {search
                ? `${filtered.length} / ${products.length} sản phẩm (trang ${currentPage})`
                : `Tổng số: ${total} sản phẩm — trang ${currentPage}/${totalPages}`}
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        </>
      )}

      {/* Add Dialog */}
      <ProductFormDialog open={showAdd} onOpenChange={setShowAdd} />

      {/* Edit Dialog */}
      {editProduct && (
        <ProductFormDialog
          key={editProduct.id}
          product={editProduct}
          open={!!editProduct}
          onOpenChange={(v) => { if (!v) setEditProduct(null); }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa{" "}
              <strong>{deleteTarget?.name}</strong> ({deleteTarget?.sku})?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              disabled={pending}
              className="bg-red-600 hover:bg-red-700"
            >
              {pending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
