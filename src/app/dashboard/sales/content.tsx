"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSalesTransaction, searchProducts } from "@/lib/actions/product";
import { toast } from "sonner";
import {
  ShoppingCart,
  Trash2,
  CreditCard,
  Search,
  Loader2,
  Pencil,
} from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export function SalesContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        { product, quantity: 1, price: product.selling_price },
        ...prev,
      ];
    });
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  // Trigger DB search
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

    if (results.length === 0) return;

    // Auto-add if exact barcode match
    const barcodeMatch = results.find(
      (p) => p.barcode && p.barcode.toLowerCase() === q
    );
    if (barcodeMatch) {
      addToCart(barcodeMatch);
      return;
    }

    // Auto-add if only 1 result
    if (results.length === 1) {
      addToCart(results[0]);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Click outside to close results
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.product.id === productId ? { ...c, quantity: qty } : c
      )
    );
  };

  const updatePrice = (productId: string, price: number) => {
    setCart((prev) =>
      prev.map((c) =>
        c.product.id === productId ? { ...c, price } : c
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const total = useMemo(
    () => cart.reduce((sum, c) => sum + c.quantity * c.price, 0),
    [cart]
  );

  const itemCount = useMemo(
    () => cart.reduce((sum, c) => sum + c.quantity, 0),
    [cart]
  );

  async function handleCheckout() {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    setIsPending(true);
    const items = cart.map((c) => ({
      product_id: c.product.id,
      quantity: c.quantity,
      price: c.price,
    }));

    const result = await createSalesTransaction(items);
    setIsPending(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      setLastTotal(total);
      setLastCount(itemCount);
      setShowInvoice(true);
      setCart([]);
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ======== TOP: THANH TOÁN (total + checkout button only) ======== */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Thanh toán
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-sm text-muted-foreground">
                Tổng cộng
              </span>
              <span className="text-2xl font-bold tabular-nums text-primary">
                {formatCurrency(total)}
              </span>
            </div>
            <Button
              className="gap-2 h-11 px-6 text-base font-semibold"
              disabled={cart.length === 0 || isPending}
              onClick={handleCheckout}
            >
              <CreditCard className="w-4 h-4" />
              {isPending
                ? "Đang xử lý..."
                : "Thanh toán"}
            </Button>
          </div>
        </div>
      </div>

      {/* ======== MIDDLE: SEARCH INPUT + RESULTS ======== */}
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

        {/* Search Results Dropdown */}
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
                    onClick={() => {
                      addToCart(product);
                    }}
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
                            {" "} | <span className="text-primary">{product.barcode}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0">
                      {formatCurrency(product.selling_price)}
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

      {/* ======== BOTTOM: DANH SÁCH BÁN (cart items with controls) ======== */}
      <div className="flex-1 rounded-xl border border-border bg-card flex flex-col min-h-[200px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Danh sách bán
          </h3>
          <span className="text-sm text-muted-foreground font-mono">
            {itemCount} sản phẩm
          </span>
        </div>

        <div className="flex-1 p-4 space-y-2 max-h-[400px] overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Chưa có sản phẩm nào</p>
              <p className="text-xs mt-1">
                Nhập barcode hoặc tìm kiếm ở ô phía trên
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
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
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                  >
                    -
                  </Button>
                  <span className="w-7 text-center text-sm font-mono font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                  >
                    +
                  </Button>
                </div>

                {/* Price */}
                <div className="flex items-center gap-1 shrink-0">
                  {editingPrice === item.product.id ? (
                    <>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.price}
                        onChange={(e) =>
                          updatePrice(
                            item.product.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        onBlur={() => setEditingPrice(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingPrice(null);
                        }}
                        className="h-7 w-20 text-xs text-right font-mono"
                        autoFocus
                      />
                      <span className="text-xs text-muted-foreground">₫</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="h-7 text-xs font-mono tabular-nums text-muted-foreground leading-7">
                        {item.price.toLocaleString("vi-VN")}₫
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingPrice(item.product.id)}
                        className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Sửa giá"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtotal */}
                <span className="text-sm font-semibold tabular-nums shrink-0 min-w-[80px] text-right">
                  {formatCurrency(item.quantity * item.price)}
                </span>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Dialog */}
      {showInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowInvoice(false)}
        >
          <div
            className="bg-background rounded-2xl shadow-2xl border border-border p-6 max-w-sm w-full mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Thanh toán thành công!</h3>
              <p className="text-sm text-muted-foreground">
                Đã xuất kho {lastCount} sản phẩm
              </p>
            </div>
            <div className="py-4 text-center">
              <p className="text-3xl font-bold tabular-nums text-primary">
                {formatCurrency(lastTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tổng doanh thu — ghi nhận theo giá bán tại thời điểm thanh toán
              </p>
            </div>
            <Button
              className="w-full h-11"
              onClick={() => setShowInvoice(false)}
            >
              Tiếp tục bán
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
