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
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { fomatCurrency, formatDateTime, formatId } from "@/lib/utils";

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  createPayPalOrder,
  approvePayPalOrder,
  updateOrderToPaidCOD,
  deliverOrder,
} from "@/lib/actions/order.actions";
import { toast } from "sonner";
import StripePayment from "./stripe-payment";

const PrintLoadingState = () => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isPending) return "Loading PayPal...";
  if (isRejected) return "Error Loading PayPal";

  return null;
};

const MarkAsPaidButton = ({ orderId }: { orderId: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const response = await updateOrderToPaidCOD(orderId);

          if (!response.success) {
            toast.error(response.message);
            return;
          }

          toast.success(response.message);
          router.refresh();
        })
      }
    >
      {isPending ? "Processing..." : "Mark As Paid"}
    </Button>
  );
};

const MarkAsDeliveredButton = ({ orderId }: { orderId: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const response = await deliverOrder(orderId);

          if (!response.success) {
            toast.error(response.message);
            return;
          }

          toast.success(response.message);
          router.refresh();
        })
      }
    >
      {isPending ? "Processing..." : "Mark As Delivered"}
    </Button>
  );
};

// 075 - order details table
const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
  stripeClientSecret,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
  stripeClientSecret: string | null;
}) => {
  const router = useRouter();

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

  const handleCreatePayPalOrder = async () => {
    const response = await createPayPalOrder(order.id);
    if (!response.success || !response.data) {
      const message = response.message || "Failed to create PayPal order";
      toast.error(message);
      throw new Error(message);
    }

    return response.data;
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    if (!data.orderID) {
      toast.error("PayPal did not return an order ID");
      return;
    }

    const response = await approvePayPalOrder(order.id, data);

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    router.refresh();
  };

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

              {/* 084 - paypal payment */}
              {!isPaid && paymentMethod === "PayPal" && (
                <div>
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                      currency: "USD",
                      intent: "capture",
                    }}
                  >
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                      onCancel={() => toast.message("Payment cancelled")}
                      onError={(error) => {
                        console.error("PayPal error", error);
                        toast.error("PayPal payment could not be completed");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {/* Stripe Payment */}
              {!isPaid && paymentMethod === "Stripe" && stripeClientSecret && (
                <StripePayment
                  priceInCents={Number(order.totalPrice) * 100}
                  orderId={order.id}
                  clientSecret={stripeClientSecret}
                />
              )}

              {/* Cash on delivery */}
              {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" && (
                <MarkAsPaidButton orderId={order.id} />
              )}

              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton orderId={order.id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
