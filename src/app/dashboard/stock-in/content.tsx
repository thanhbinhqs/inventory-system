"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  PackagePlus,
  PackageCheck,
  Loader2,
  Clock,
  ShoppingCart,
  Barcode,
  Hash,
  Package,
  TrendingDown,
  CalendarDays,
  AlertTriangle,
  CircleCheckBig,
} from "lucide-react";
import { searchProducts, quickImport, getProductWithStock } from "@/lib/actions/product";
import { toast } from "sonner";

interface ImportedItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  note: string;
  time: Date;
}

interface ProductDetail {
  product: Product;
  current_stock: number;
  last_import_price: number | null;
  last_import_date: string | null;
}

const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function StockInContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const [selected, setSelected] = useState<Product | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(0);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const [importedItems, setImportedItems] = useState<ImportedItem[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);

  // Tổng kết
  const totalQuantity = importedItems.reduce((s, i) => s + i.quantity, 0);
  const totalValue = importedItems.reduce((s, i) => s + i.quantity * i.price, 0);

  // ======== SEARCH (giống page bán hàng) ========
  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setSearching(true);
    setShowResults(true);

    const result = await searchProducts(q);
    setSearching(false);

    if (result.error) {
      toast.error(result.error);
      setSearchResults([]);
      return;
    }

    const results = result.products ?? [];
    setSearchResults(results);

    // Auto-select nếu barcode trùng khớp chính xác
    const barcodeMatch = results.find(
      (p) => p.barcode && p.barcode.toLowerCase() === q
    );
    if (barcodeMatch) {
      openImportDialog(barcodeMatch);
      return;
    }

    // Auto-select nếu chỉ 1 kết quả
    if (results.length === 1) {
      openImportDialog(results[0]);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Click outside → đóng dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-scroll xuống danh sách khi có item mới
  useEffect(() => {
    if (importedItems.length > 0 && listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [importedItems.length]);

  // ======== IMPORT DIALOG ========
  const openImportDialog = async (product: Product) => {
    setSelected(product);
    setPrice(product.cost_price);
    setQuantity("");
    setNote("");
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setProductDetail(null);
    setDialogOpen(true);

    // Fetch chi tiết + tồn kho
    setLoadingDetail(true);
    const detail = await getProductWithStock(product.id);
    setLoadingDetail(false);

    if (!("error" in detail)) {
      setProductDetail(detail as ProductDetail);
      // Ưu tiên giá nhập lần cuối
      if (detail.last_import_price) {
        setPrice(detail.last_import_price);
      }
    }

    setTimeout(() => qtyRef.current?.focus(), 150);
  };

  const handleSubmit = (formData: FormData) => {
    if (!selected) return;
    startTransition(async () => {
      const result = await quickImport(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        // Thêm vào danh sách vừa nhập
        const item: ImportedItem = {
          id: generateId(),
          product: selected,
          quantity: parseInt(quantity) || 1,
          price: price,
          note: note,
          time: new Date(),
        };
        setImportedItems((prev) => [item, ...prev]);

        toast.success(`Nhập kho ${selected.name} thành công!`);
        setDialogOpen(false);
        setSelected(null);
        setProductDetail(null);
        setQuantity("");
        setPrice(0);
        setNote("");
        inputRef.current?.focus();
      }
    });
  };

  const calcTotal = () => {
    const q = parseInt(quantity) || 0;
    return q * price;
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ======== TOP: TỔNG KẾT PHIÊN NHẬP ======== */}
      {importedItems.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-primary" />
              Phiên nhập kho
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-baseline gap-6">
                <div>
                  <span className="text-sm text-muted-foreground">Số sản phẩm</span>
                  <p className="text-xl font-bold tabular-nums">{importedItems.length}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tổng số lượng</span>
                  <p className="text-xl font-bold tabular-nums">{totalQuantity}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tổng giá trị</span>
                  <p className="text-xl font-bold tabular-nums text-primary">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======== MIDDLE: SEARCH INPUT + DROPDOWN ======== */}
      <div ref={searchRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Nhập barcode, tên sản phẩm, mã SP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 h-12 text-base"
              autoFocus
            />
          </div>
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={handleSearch}
            title="Tìm kiếm sản phẩm"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Dropdown kết quả tìm kiếm */}
        {showResults && searchQuery.trim() && (
          <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[360px] overflow-y-auto">
            {searching && (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tìm kiếm...
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs text-muted-foreground border-b border-border/50">
                  {searchResults.length} kết quả cho &quot;{searchQuery.trim()}&quot;
                </p>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => openImportDialog(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {product.sku}
                        {product.barcode && (
                          <>
                            {" | "}<span className="text-primary">{product.barcode}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0">
                      {formatCurrency(product.cost_price)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!searching && searchResults.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Không tìm thấy sản phẩm &quot;{searchQuery.trim()}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======== BOTTOM: DANH SÁCH SẢN PHẨM VỪA NHẬP ======== */}
      <div className="flex-1 rounded-xl border border-border bg-card flex flex-col min-h-[200px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <PackagePlus className="w-4 h-4" />
            Sản phẩm vừa nhập
          </h3>
          <span className="text-sm text-muted-foreground font-mono">
            {importedItems.length} sản phẩm
          </span>
        </div>

        <div className="flex-1 p-4 space-y-2 max-h-[400px] overflow-y-auto" ref={listRef}>
          {importedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <PackagePlus className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Chưa nhập sản phẩm nào</p>
              <p className="text-xs mt-1">
                Tìm kiếm sản phẩm ở ô phía trên để bắt đầu nhập kho
              </p>
            </div>
          ) : (
            importedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border hover:bg-muted/60 transition-colors"
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {item.product.sku}
                    {item.product.barcode && <> | {item.product.barcode}</>}
                  </p>
                </div>

                {/* Quantity */}
                <span className="text-sm font-mono tabular-nums shrink-0">
                  SL: <span className="font-bold">{item.quantity}</span>
                </span>

                {/* Price */}
                <span className="text-sm font-mono tabular-nums text-muted-foreground shrink-0">
                  {formatCurrency(item.price)}
                </span>

                {/* Total */}
                <span className="text-sm font-semibold tabular-nums shrink-0 min-w-[80px] text-right">
                  {formatCurrency(item.quantity * item.price)}
                </span>

                {/* Note */}
                {item.note && (
                  <span className="text-[10px] text-muted-foreground italic max-w-[100px] truncate shrink-0 hidden sm:inline">
                    {item.note}
                  </span>
                )}

                {/* Time */}
                <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======== DIALOG NHẬP KHO CHI TIẾT ======== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <PackagePlus className="w-5 h-5 text-primary" />
              Nhập kho
            </DialogTitle>
            <DialogDescription className="text-sm">
              Nhập số lượng và giá vốn cho sản phẩm
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <form action={handleSubmit}>
              <input type="hidden" name="product_id" value={selected.id} />

              {/* ======== PRODUCT INFO CARD ======== */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 mb-4 min-h-[170px] flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Product icon + name */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold truncate">
                        {selected.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {selected.sku}
                        </span>
                        {selected.barcode && (
                          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                            <Barcode className="w-3 h-3" />
                            {selected.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Low stock warning */}
                  {loadingDetail ? (
                    <Badge variant="outline" className="shrink-0 animate-pulse">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ...
                    </Badge>
                  ) : productDetail && productDetail.current_stock <= (selected.min_stock || 0) ? (
                    <Badge variant="destructive" className="shrink-0 gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Tồn: {productDetail.current_stock}
                    </Badge>
                  ) : productDetail ? (
                    <Badge variant="outline" className="shrink-0 gap-1">
                      <CircleCheckBig className="w-3 h-3 text-green-500" />
                      Tồn: {productDetail.current_stock}
                    </Badge>
                  ) : null}
                </div>

                <Separator className="my-3" />

                {/* Detail grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Giá vốn</span>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(selected.cost_price)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Giá bán</span>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(selected.selling_price)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Tồn kho</span>
                    <p className="text-sm font-semibold tabular-nums">
                      {loadingDetail ? (
                        <span className="text-muted-foreground animate-pulse">...</span>
                      ) : (
                        productDetail?.current_stock ?? <span className="text-muted-foreground">...</span>
                      )}
                    </p>
                  </div>

                  {/* Last import - ALWAYS render this row to prevent layout shift */}
                  <div className={`space-y-0.5 col-span-2 sm:col-span-3 ${productDetail?.last_import_price != null ? '' : 'invisible'}`}>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Lần nhập gần nhất
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono tabular-nums">
                        {productDetail?.last_import_price != null
                          ? `${formatCurrency(productDetail.last_import_price)} / sản phẩm`
                          : '0 ₫ / sản phẩm'}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {productDetail?.last_import_date != null
                          ? new Date(productDetail.last_import_date).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : '--/--/----'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ======== FORM FIELDS ======== */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qty" className="text-sm font-medium flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                      Số lượng
                    </Label>
                    <Input
                      id="qty"
                      ref={qtyRef}
                      name="quantity"
                      type="number"
                      min="1"
                      required
                      placeholder="Nhập số lượng..."
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="import_price" className="text-sm font-medium flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-muted-foreground" />
                      Đơn giá nhập
                    </Label>
                    <Input
                      id="import_price"
                      name="price"
                      type="number"
                      min="0"
                      step="1000"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import_note" className="text-sm font-medium">
                    Ghi chú
                  </Label>
                  <Input
                    id="import_note"
                    name="note"
                    placeholder="Ghi chú (không bắt buộc)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                {/* Tổng tiền dự kiến - ALWAYS render to prevent layout shift */}
                <div className={`rounded-lg border p-3 flex items-center justify-between min-h-[48px] ${
                  (parseInt(quantity) || 0) > 0 && price > 0
                    ? 'bg-primary/5 border-primary/10'
                    : 'bg-transparent border-transparent'
                }`}>
                  <span className="text-sm font-medium text-muted-foreground">Tổng tiền dự kiến</span>
                  <span className={`text-lg font-bold tabular-nums ${
                    (parseInt(quantity) || 0) > 0 && price > 0
                      ? 'text-primary'
                      : 'text-muted-foreground/30'
                  }`}>
                    {(parseInt(quantity) || 0) > 0 && price > 0
                      ? formatCurrency(calcTotal())
                      : '0 ₫'}
                  </span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={pending || !quantity || parseInt(quantity) < 1 || price <= 0}
                >
                  {pending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <PackagePlus className="w-4 h-4 mr-2" />
                      Nhập kho
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
