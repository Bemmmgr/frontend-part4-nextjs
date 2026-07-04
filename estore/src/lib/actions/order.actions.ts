"use server";

import { auth } from "@/auth";
import { converToPlainObject, formatError } from "../utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";

// 071 - create order action
// create order & create order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User not authenticated");

    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const cart = await getMyCart();
    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    // create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // create a transaction to create order and order items in prisma
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // create order
      const insertedOrder = await tx.order.create({ data: order });

      //   create orderItems from cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            orderId: insertedOrder.id,
            productId: item.productId,
            qty: item.quantity,
            price: item.price,
            name: item.name,
            slug: item.slug,
            image: item.image,
          },
        });
      }

      //  create order - then clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("Order not created");

    return {
      success: true,
      message: "Order created",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: await formatError(error) };
  }
}

// 072 - order page & action
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });

  return converToPlainObject(data);
}
