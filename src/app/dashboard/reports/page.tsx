import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

async function getReportData() {
  const supabase = await createClient();

  // Get summary
  const { data: summary } = await supabase
    .from("inventory_summary")
    .select("*");

  const totalRevenue =
    summary?.reduce((acc, item) => acc + Number(item.total_revenue), 0) ?? 0;
  const totalInvestment =
    summary?.reduce((acc, item) => acc + Number(item.total_investment), 0) ?? 0;
  const totalProfit =
    summary?.reduce((acc, item) => acc + Number(item.profit), 0) ?? 0;

  // Monthly breakdown
  const { data: transactions } = await supabase
    .from("inventory_transactions")
    .select("type, quantity, price, transaction_date, product:products(name)")
    .order("transaction_date", { ascending: false });

  // Aggregate by month
  const monthlyData = new Map<
    string,
    { revenue: number; cost: number; count: number }
  >();

  transactions?.forEach((t: any) => {
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
  const productRevenue = new Map<string, { name: string; revenue: number; quantity: number }>();
  transactions
    ?.filter((t: any) => t.type === "OUT")
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
    totalInvestment,
    totalProfit,
    monthlyReport,
    topProducts,
  };
}

async function ReportContent() {
  const data = await getReportData();

  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(data.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng vốn đầu tư
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(data.totalInvestment)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lợi nhuận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data.totalProfit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(data.totalProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Report Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
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
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
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
                      {i + 1}
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
                      Chưa có dữ liệu bán hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function ReportsPage() {
  return (
    <>
      <Header
        title="Báo cáo"
        description="Phân tích doanh thu, lợi nhuận và sản phẩm"
      />
      <div className="flex-1 p-6 space-y-6">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full rounded-xl" />
                </CardContent>
              </Card>
            </div>
          }
        >
          <ReportContent />
        </Suspense>
      </div>
    </>
  );
}
