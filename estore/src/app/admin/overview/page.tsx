import { auth } from "@/auth";
import { Metadata } from "next";
import Link from "next/link";
import Charts from "./charts";
import { requireAdmin } from "@/lib/auth-guard";
import type { LucideIcon } from "lucide-react";
import { getOrderSummary } from "@/lib/actions/order.actions";

import { BadgeDollarSign, Barcode, CreditCard, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fomatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) => {
  return (
    <Card className="border py-0 transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex size-9 items-center justify-center rounded-md bg-muted">
          <Icon className="size-5 text-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0">
        <div className="text-2xl font-bold tracking-normal">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const AdminOverviewPage = async () => {
  await requireAdmin();
  const session = await auth();

  if (session?.user?.role !== "admin")
    throw new Error("User is not authorized");

  const summary = await getOrderSummary();
  const totalRevenue = summary.totalSales._sum.totalPrice?.toString() || "0";

  return (
    <div className="space-y-6">
      <h1 className="h2-bold tracking-normal">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={fomatCurrency(totalRevenue)}
          description="All-time paid and unpaid order value"
          icon={BadgeDollarSign}
        />
        <StatCard
          title="Sales"
          value={formatNumber(summary.ordersCount)}
          description="Total orders created"
          icon={CreditCard}
        />
        <StatCard
          title="Customers"
          value={formatNumber(summary.usersCount)}
          description="Registered customer accounts"
          icon={Users}
        />
        <StatCard
          title="Products"
          value={formatNumber(summary.productsCount)}
          description="Products available in catalog"
          icon={Barcode}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold">Overview</CardTitle>
          </CardHeader>
          <CardContent className="min-h-80 pt-2">
            <Charts data={{ salesData: summary.salesData }} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    BUYER
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    DATE
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-muted-foreground">
                    TOTAL
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-muted-foreground">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.latestSales.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order?.user?.name ? order.user.name : "Deleted User"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(order.createdAt).dateOnly}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {fomatCurrency(order.totalPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/order/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
