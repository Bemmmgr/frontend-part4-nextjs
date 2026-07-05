"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fomatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order } from "@/types";
import Image from "next/image";
import Link from "next/link";

// 075 - order details table
const OrderDetailsTable = ({ order }: { order: Order }) => {
  const {
    id,
    shippingAddress,
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
  } = order;

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(id)}</h1>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <Card className="border py-0">
            <CardContent className="space-y-3 p-4">
              <h2 className="text-xl">Payment Method</h2>
              <p className="text-sm">{paymentMethod}</p>

              {isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not paid</Badge>
              )}
            </CardContent>
          </Card>

          <Card className="border py-0">
            <CardContent className="space-y-3 p-4">
              <h2 className="text-xl">Shipping Address</h2>

              <div className="text-sm leading-6">
                <p>{shippingAddress.fullName}</p>
                <p>
                  {shippingAddress.streetAddress}, {shippingAddress.city}{" "}
                  {shippingAddress.postalCode}, {shippingAddress.country}
                </p>
              </div>

              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not Delivered</Badge>
              )}
            </CardContent>
          </Card>

          <Card className="border py-0">
            <CardContent className="space-y-3 p-4">
              <h2 className="text-xl">Order Items</h2>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-32 text-center">Quantity</TableHead>
                    <TableHead className="w-32 text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={`${item.orderId}-${item.productId}`}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex min-w-72 items-center gap-4"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded object-cover"
                          />
                          <span className="whitespace-normal">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{item.qty}</TableCell>
                      <TableCell className="text-right">
                        {fomatCurrency(item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border py-0">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span>Items</span>
                  <span>{fomatCurrency(itemsPrice)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Tax</span>
                  <span>{fomatCurrency(taxPrice)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Shipping</span>
                  <span>{fomatCurrency(shippingPrice)}</span>
                </div>
                <div className="flex justify-between gap-4 font-medium">
                  <span>Total</span>
                  <span>{fomatCurrency(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
