"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { InventoryTransaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const columns: ColumnDef<InventoryTransaction>[] = [
  {
    id: "STT",
    header: "STT",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.index + 1}</span>,
    size: 60,
  },
  {
    id: "product.name",
    header: "Sản phẩm",
    accessorFn: (originalRow) => originalRow.product?.name ?? "N/A",
    cell: ({ row }) => {
      const product = row.original.product;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{product?.name ?? "N/A"}</span>
          <span className="text-xs text-muted-foreground">
            {product?.sku ?? ""}
          </span>
        </div>
      );
    },
  },
  {
    id: "type",
    header: "Loại",
    accessorFn: (originalRow) => originalRow.type,
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge
          variant={type === "IN" ? "default" : "destructive"}
          className="font-medium"
        >
          {type === "IN" ? "NHẬP" : "XUẤT"}
        </Badge>
      );
    },
    size: 90,
  },
  {
    id: "quantity",
    header: "Số lượng",
    accessorFn: (originalRow) => originalRow.quantity,
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">
        {row.original.quantity.toLocaleString("vi-VN")}
      </span>
    ),
    size: 100,
  },
  {
    id: "price",
    header: "Đơn giá",
    accessorFn: (originalRow) => originalRow.price,
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.price)}</span>
    ),
    size: 130,
  },
  {
    id: "total",
    header: "Thành tiền",
    accessorFn: (originalRow) => originalRow.quantity * originalRow.price,
    cell: ({ row }) => (
      <span className="tabular-nums font-semibold">
        {formatCurrency(row.original.quantity * row.original.price)}
      </span>
    ),
    size: 140,
  },
  {
    id: "transaction_date",
    header: "Ngày",
    accessorFn: (originalRow) => originalRow.transaction_date,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.transaction_date)}
      </span>
    ),
    size: 160,
  },
  {
    id: "note",
    header: "Ghi chú",
    accessorFn: (originalRow) => originalRow.note ?? "",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.note || "-"}
      </span>
    ),
    size: 150,
  },
];
