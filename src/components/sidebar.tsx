"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  Menu,
  X,
  LogOut,
  QrCode,
  PackagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Sản phẩm",
    href: "/dashboard/products",
    icon: QrCode,
  },
  {
    title: "Nhập kho",
    href: "/dashboard/stock-in",
    icon: PackagePlus,
  },
  {
    title: "Bán hàng",
    href: "/dashboard/sales",
    icon: ShoppingCart,
  },
  {
    title: "Lịch sử bán",
    href: "/dashboard/history",
    icon: History,
  },
];

function NavLinks({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", className)}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Quản lý Kho</h1>
            <p className="text-xs text-muted-foreground">Hệ thống quản trị</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <NavLinks />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <form action={signOut}>
          <Button
            variant="ghost"
            type="submit"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </form>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-lg hover:bg-muted p-2 md:hidden">
          <Menu className="w-5 h-5" />
        </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Quản lý Kho</h1>
                <p className="text-xs text-muted-foreground">Hệ thống quản trị</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 p-4">
            <NavLinks onClick={() => setOpen(false)} />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <form action={signOut}>
              <Button
                variant="ghost"
                type="submit"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
