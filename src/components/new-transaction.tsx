"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, QrCode } from "lucide-react";
import { createTransaction } from "@/lib/actions/inventory";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { BarcodeScanner } from "@/components/barcode-scanner";

interface NewTransactionDialogProps {
  products: Product[];
}

export function NewTransactionDialog({
  products,
}: NewTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [pending, startTransition] = useTransition();
  const [showScanner, setShowScanner] = useState(false);

  // Find product by barcode
  const findProductByBarcode = (barcode: string) => {
    const product = products.find(
      (p) => p.barcode?.toLowerCase() === barcode.toLowerCase()
    );
    if (product) {
      setSelectedProduct(product.id);
      toast.success(`Đã tìm thấy: ${product.name}`);
      setShowScanner(false);
    } else {
      toast.error(`Không tìm thấy sản phẩm với mã: ${barcode}`);
    }
  };

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTransaction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(type === "IN" ? "Nhập kho thành công!" : "Xuất kho thành công!");
        setOpen(false);
        setSelectedProduct("");
        setType("IN");
        setShowScanner(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-xs hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Giao dịch mới
        </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm giao dịch</DialogTitle>
          <DialogDescription>
            Nhập hoặc xuất hàng hóa trong kho
          </DialogDescription>
        </DialogHeader>

        {/* Barcode Scanner Toggle */}
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant={showScanner ? "default" : "outline"}
            size="sm"
            onClick={() => setShowScanner(!showScanner)}
            className="gap-2"
          >
            <QrCode className="w-4 h-4" />
            {showScanner ? "Ẩn máy quét" : "Quét QR/Barcode"}
          </Button>
        </div>

        {showScanner && (
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <BarcodeScanner
              onScan={findProductByBarcode}
              onError={(err) => toast.error(err)}
            />
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="product_id" value={selectedProduct} />
          <input type="hidden" name="type" value={type} />

          <div className="space-y-2">
            <Label htmlFor="product">Sản phẩm {selectedProduct && <span className="text-xs text-muted-foreground">(đã chọn)</span>}</Label>
            <Select
              value={selectedProduct}
              onValueChange={(value) => setSelectedProduct(value ?? "")}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      {p.name} ({p.sku})
                      {p.barcode && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          QR:{p.barcode}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Loại giao dịch</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "IN" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setType("IN")}
              >
                Nhập kho
              </Button>
              <Button
                type="button"
                variant={type === "OUT" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setType("OUT")}
              >
                Xuất kho
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                required
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Đơn giá</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1000"
                required
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_date">Ngày giao dịch</Label>
            <Input
              id="transaction_date"
              name="transaction_date"
              type="datetime-local"
              defaultValue={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Input
              id="note"
              name="note"
              placeholder="Ghi chú (không bắt buộc)"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setShowScanner(false);
              }}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
