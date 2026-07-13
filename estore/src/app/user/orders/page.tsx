import Link from "next/link";
import { Metadata } from "next";
import { getMyOrders } from "@/lib/actions/order.actions";
import { fomatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 086/087
export const metadata: Metadata = {
  title: "My orders",
};

const OrdersPage = async (props: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page } = await props.searchParams;
  const currentPage = Number(page) || 1;

  const orders = await getMyOrders({
    page: currentPage,
  });

  return (
    <div className="space-y-4">
      <h2 className="h2-bold">Orders</h2>

      {orders.data.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          You have no orders.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead className="text-right">TOTAL</TableHead>
              <TableHead className="text-center">PAID</TableHead>
              <TableHead className="text-center">DELIVERED</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell className="text-right">
                  {fomatCurrency(order.totalPrice)}
                </TableCell>
                <TableCell className="text-center">
                  {order.isPaid && order.paidAt ? (
                    <Badge variant="secondary">
                      {formatDateTime(order.paidAt).dateOnly}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Not paid</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {order.isDelivered && order.deliveredAt ? (
                    <Badge variant="secondary">
                      {formatDateTime(order.deliveredAt).dateOnly}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Not delivered</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {orders.totalPages > 1 && (
        <Pagination page={Number(page) || 1} totalPages={orders?.totalPages} />
      )}
    </div>
  );
};

export default OrdersPage;
