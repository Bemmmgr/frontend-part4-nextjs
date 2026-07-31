import { auth } from "@/auth";
import { Metadata } from "next";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import DeleteDialog from "@/components/shared/delete-dialog";
import { fomatCurrency, formatDateTime, formatId } from "@/lib/utils";

import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Admin Orders",
};

// 099 - admin orders page
const AdminOrdersPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const { page = "1", query: searchText } = await props.searchParams;
  const session = await auth();

  if (session?.user?.role !== "admin")
    throw new Error("User is not authorized");

  const orders = await getAllOrders({
    query: searchText,
    page: Number(page),
    limit: 2,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Orders</h1>
        {searchText && (
          <div>
            Filtered by <i>&quot;{searchText}&quot;</i>{" "}
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                Remove Filter
              </Button>
            </Link>
          </div>
        )}
      </div>

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
              <TableHead>BUYER</TableHead>
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
                <TableCell>{order.user.name}</TableCell>
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

                  <DeleteDialog id={order.id} action={deleteOrder} />
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

export default AdminOrdersPage;
