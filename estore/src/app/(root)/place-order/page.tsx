import { auth } from "@/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { ShippingAddress } from "@/types";
import CheckoutSteps from "@/components/shared/checkout-steps";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fomatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

// 070 - place order page
export const metadata: Metadata = {
  title: "Place Order",
};

const PlaceOrderPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("User not found");

  const user = await getUserById(userId);

  if (!cart || cart.items.length === 0) redirect("/cart");
  if (!user.address) redirect("/shipping-address");
  if (!user.paymentMethod) redirect("/payment-method");

  const userAddress = user.address as ShippingAddress;

  // get session user userId
  return (
    <>
      <CheckoutSteps current={3} />
      <h1 className="py-4 text-2xl">Place Order</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="md:col-span-2 overflow-x-auto space-y-4">
          <Card className="border py-0">
            <CardContent className="p-4 space-y-3">
              <h2 className="text-xl">Shipping Address</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.streetAddress}, {userAddress.city}{" "}
                {userAddress.postalCode}, {userAddress.country}{" "}
              </p>
              <Button asChild variant="outline">
                <Link href="/shipping-address">Edit</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border py-0">
            <CardContent className="p-4 space-y-3">
              <h2 className="text-xl">Payment Method</h2>
              <p>{user.paymentMethod}</p>

              <Button asChild variant="outline">
                <Link href="/payment-method">Edit</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border py-0">
            <CardContent className="p-4 space-y-3">
              <h2 className="text-xl">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-32 text-center">
                      Quantity
                    </TableHead>
                    <TableHead className="w-32 text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center gap-4"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded object-cover"
                          />
                          <span>{item.name}</span>
                        </Link>
                      </TableCell>

                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
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
            <CardContent className="p-4 space-y-4">
              <h2 className="text-xl">Order Summary</h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <div>Items</div>
                  <div>{fomatCurrency(cart.itemsPrice)}</div>
                </div>

                <div className="flex justify-between">
                  <div>Tax</div>
                  <div>{fomatCurrency(cart.taxPrice)}</div>
                </div>

                <div className="flex justify-between">
                  <div>Shipping</div>
                  <div>{fomatCurrency(cart.shippingPrice)}</div>
                </div>

                <div className="flex justify-between font-bold">
                  <div>Total</div>
                  <div>{fomatCurrency(cart.totalPrice)}</div>
                </div>
              </div>

              <Button className="w-full" type="button">
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderPage;
