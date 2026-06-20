import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Crown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ReportFilter } from "@/components/report-filter";
import { startOfDay, endOfDay, subDays, startOfYear, startOfMonth, format } from "date-fns";

// ============================================================
// HELPERS
// ============================================================

function parseDateRange(searchParams: Promise<{ [key: string]: string | string[] | undefined }>) {
  // Default: 30 ngày gần nhất
  const now = new Date();
  const defaultFrom = startOfDay(subDays(now, 29));
  const defaultTo = endOfDay(now);

  return {
    from: defaultFrom,
    to: defaultTo,
  };
}

// ============================================================
// DATA FETCHERS
// ============================================================

async function getDashboardData() {
  const supabase = await createClient();

  // Get inventory summary
  const { data: summary } = await supabase
    .from("inventory_summary")
    .select("*");

  const totalInventoryValue =
    summary?.reduce((acc, item) => acc + Number(item.inventory_value), 0) ?? 0;
  const totalRevenue =
    summary?.reduce((acc, item) => acc + Number(item.total_revenue), 0) ?? 0;
  const lowStockCount =
    summary?.filter(
      (item) => Number(item.current_stock) <= Number(item.min_stock),
    ).length ?? 0;
  const totalProducts = summary?.length ?? 0;

  // Get revenue by month for chart (always full data)
  const { data: transactions } = await supabase
    .from("inventory_transactions")
    .select("type, quantity, price, transaction_date")
    .eq("type", "OUT")
    .order("transaction_date", { ascending: true });

  // Aggregate revenue by month
  const revenueByMonth = new Map<string, number>();
  transactions?.forEach((t) => {
    const date = new Date(t.transaction_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const revenue = Number(t.quantity) * Number(t.price);
    revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + revenue);
  });

  const revenueTrend = Array.from(revenueByMonth.entries()).map(
    ([date, revenue]) => ({
      date,
      revenue,
    }),
  );

  return {
    totalInventoryValue,
    totalRevenue,
    lowStockCount,
    totalProducts,
    revenueTrend,
  };
}

async function getReportData(from: Date, to: Date) {
  const supabase = await createClient();

  const fromStr = from.toISOString();
  const toStr = to.toISOString();

  // Get all transactions in date range (both IN and OUT)
  const { data: transactions } = await supabase
    .from("inventory_transactions")
    .select("type, quantity, price, transaction_date, product:products(name)")
    .gte("transaction_date", fromStr)
    .lte("transaction_date", toStr)
    .order("transaction_date", { ascending: true });

  const safeTx = transactions ?? [];

  // Totals
  let totalRevenue = 0;
  let totalCost = 0;

  safeTx.forEach((t: any) => {
    const amount = Number(t.quantity) * Number(t.price);
    if (t.type === "OUT") {
      totalRevenue += amount;
    } else {
      totalCost += amount;
    }
  });

  const totalProfit = totalRevenue - totalCost;

  // Monthly breakdown
  const monthlyData = new Map<
    string,
    { revenue: number; cost: number; count: number }
  >();

  safeTx.forEach((t: any) => {
    const date = new Date(t.transaction_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const amount = Number(t.quantity) * Number(t.price);

    if (!monthlyData.has(key)) {
      monthlyData.set(key, { revenue: 0, cost: 0, count: 0 });
    }

    const entry = monthlyData.get(key)!;
    entry.count++;
    if (t.type === "OUT") {
      entry.revenue += amount;
    } else {
      entry.cost += amount;
    }
  });

  const monthlyReport = Array.from(monthlyData.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, data]) => ({
      month,
      ...data,
      profit: data.revenue - data.cost,
    }));

  // Top products by revenue
  const productRevenue = new Map<
    string,
    { name: string; revenue: number; quantity: number }
  >();
  safeTx
    .filter((t: any) => t.type === "OUT")
    .forEach((t: any) => {
      const name = t.product?.name ?? "N/A";
      const amount = Number(t.quantity) * Number(t.price);
      if (!productRevenue.has(name)) {
        productRevenue.set(name, { name, revenue: 0, quantity: 0 });
      }
      const entry = productRevenue.get(name)!;
      entry.revenue += amount;
      entry.quantity += Number(t.quantity);
    });

  const topProducts = Array.from(productRevenue.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    totalRevenue,
    totalInvestment: totalCost,
    totalProfit,
    monthlyReport,
    topProducts,
  };
}

// ============================================================
// LOADING SKELETONS
// ============================================================

function LoadingCard() {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function LoadingTable() {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-40 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

// ============================================================
// DASHBOARD CARDS
// ============================================================

async function DashboardCards() {
  const data = await getDashboardData();

  const cards = [
    {
      title: "Tổng giá trị kho",
      value: formatCurrency(data.totalInventoryValue),
      description: "Vốn tồn kho hiện tại",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
    },
    {
      title: "Tổng doanh thu",
      value: formatCurrency(data.totalRevenue),
      description: "Tổng doanh thu đã bán",
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    },
    {
      title: "Sản phẩm",
      value: data.totalProducts.toString(),
      description: "Tổng số mặt hàng",
      icon: Package,
      color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30",
    },
    {
      title: "Sắp hết hàng",
      value: data.lowStockCount.toString(),
      description: "Sản phẩm cần nhập thêm",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// REVENUE CHART
// ============================================================

async function RevenueChart() {
  const data = await getDashboardData();

  if (data.revenueTrend.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Xu hướng doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chưa có dữ liệu doanh thu
          </div>
        </CardContent>
      </Card>
    );
  }

  const { AreaChartComponent } = await import(
    "@/components/dashboard-chart"
  );

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Xu hướng doanh thu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <AreaChartComponent data={data.revenueTrend} />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// REPORT SUMMARY CARDS (with date range)
// ============================================================

async function ReportSummaryCards({ from, to }: { from: Date; to: Date }) {
  const data = await getReportData(from, to);

  const cards = [
    {
      title: "Doanh thu",
      value: formatCurrency(data.totalRevenue),
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    },
    {
      title: "Vốn đầu tư",
      value: formatCurrency(data.totalInvestment),
      icon: TrendingDown,
      color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
    },
    {
      title: "Lợi nhuận",
      value: formatCurrency(data.totalProfit),
      icon: BarChart3,
      color:
        data.totalProfit >= 0
          ? "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30"
          : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                card.title === "Lợi nhuận"
                  ? data.totalProfit >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                  : ""
              }`}
            >
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// MONTHLY REPORT TABLE (with date range)
// ============================================================

async function MonthlyReportTable({ from, to }: { from: Date; to: Date }) {
  const data = await getReportData(from, to);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Báo cáo theo tháng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Tháng
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                  Doanh thu
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                  Vốn
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                  Lợi nhuận
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                  GD
                </th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyReport.map((row) => (
                <tr
                  key={row.month}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{row.month}</td>
                  <td className="text-right py-3 px-4 tabular-nums">
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="text-right py-3 px-4 tabular-nums">
                    {formatCurrency(row.cost)}
                  </td>
                  <td
                    className={`text-right py-3 px-4 tabular-nums font-medium ${
                      row.profit >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(row.profit)}
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">
                    {row.count}
                  </td>
                </tr>
              ))}
              {data.monthlyReport.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Chưa có dữ liệu trong khoảng thời gian này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// TOP PRODUCTS TABLE (with date range)
// ============================================================

async function TopProductsTable({ from, to }: { from: Date; to: Date }) {
  const data = await getReportData(from, to);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          Sản phẩm bán chạy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  #
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Sản phẩm
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                  SL bán
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((product, i) => (
                <tr
                  key={product.name}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 text-muted-foreground">
                    <Badge variant="outline" className="font-mono text-xs">
                      {i + 1}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="text-right py-3 px-4 tabular-nums">
                    {product.quantity.toLocaleString("vi-VN")}
                  </td>
                  <td className="text-right py-3 px-4 tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
              {data.topProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Chưa có dữ liệu bán hàng trong khoảng thời gian này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default async function DashboardPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Parse date range from search params
  const sp = await props.searchParams;
  const now = new Date();

  let fromDate: Date;
  let toDate: Date;

  if (sp?.from && typeof sp.from === "string") {
    fromDate = new Date(sp.from);
  } else {
    fromDate = startOfDay(subDays(now, 29)); // default 30 ngày
  }

  if (sp?.to && typeof sp.to === "string") {
    toDate = endOfDay(new Date(sp.to));
  } else {
    toDate = endOfDay(now);
  }

  return (
    <>
      <Header
        title="Tổng quan"
        description="Bảng điều khiển quản lý kho hàng và dòng tiền"
      />
      <div className="flex-1 p-6 space-y-6">
        {/* KPI Cards */}
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          }
        >
          <DashboardCards />
        </Suspense>

        {/* Revenue Chart */}
        <Suspense
          fallback={
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-xl" />
              </CardContent>
            </Card>
          }
        >
          <RevenueChart />
        </Suspense>

        {/* FILTER BAR + BÁO CÁO */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Báo cáo tài chính
            </h2>
            <ReportFilter />
          </div>

          {/* Report Summary Cards */}
          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            }
          >
            <ReportSummaryCards from={fromDate} to={toDate} />
          </Suspense>

          {/* Monthly Report Table */}
          <Suspense fallback={<LoadingTable />}>
            <MonthlyReportTable from={fromDate} to={toDate} />
          </Suspense>

          {/* Top Products */}
          <Suspense fallback={<LoadingTable />}>
            <TopProductsTable from={fromDate} to={toDate} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
