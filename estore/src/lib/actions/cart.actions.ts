"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { CartItem } from "@/types";
import { converToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema } from "../validators";

const CART_COOKIE = "sessionCartId";
const TAX_RATE = 0.15;
const SHIPPING_PRICE = 10;
const FREE_SHIPPING_MIN_PRICE = 100;

type CartRow = NonNullable<Awaited<ReturnType<typeof prisma.cart.findFirst>>>;
type ParsedCartRow = Omit<CartRow, "items"> & { items: CartItem[] };

// 046 - add to cart actions
export async function addItemToCart(data: CartItem) {
  try {
    // parse and validate item
    const item = cartItemSchema.parse(data);

    // check for cart cookie and current user
    const { sessionCartId, userId } = await getCartContext();

    // find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    if (!product) throw new Error("Product not found");

    // get Cart, merging an anonymous cart into the user cart when needed
    const cart = await getCurrentCart(sessionCartId, userId);
    const existingItem = cart?.items.find(
      (cartItem) => cartItem.productId === item.productId,
    );

    const requestedQuantity = (existingItem?.quantity || 0) + item.quantity;

    if (product.stock < requestedQuantity) {
      throw new Error("Not enough stock");
    }

    const items = cart
      ? existingItem
        ? cart.items.map((cartItem) =>
            cartItem.productId === item.productId
              ? { ...cartItem, quantity: requestedQuantity }
              : cartItem,
          )
        : [...cart.items, item]
      : [item];

    const cartData = buildCartData(items);

    if (cart) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: cartData,
      });
    } else {
      await prisma.cart.create({
        data: {
          ...cartData,
          sessionCartId,
          userId,
        },
      });
    }

    revalidatePath("/cart");
    revalidatePath(`/product/${item.slug}`);

    return {
      success: true,
      message: "Item added to cart successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: await formatError(error),
    };
  }
}

export async function getMyCart() {
  const { sessionCartId, userId } = await getCartContext();
  const cart = await getCurrentCart(sessionCartId, userId);

  if (!cart) return undefined;

  // convert decimals and return
  return converToPlainObject({
    ...cart,
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

async function getCartContext() {
  const sessionCartId = (await cookies()).get(CART_COOKIE)?.value;

  if (!sessionCartId) {
    throw new Error("Cart session not found");
  }

  const session = await auth();
  const user = session?.user as { id?: string } | undefined;

  return {
    sessionCartId,
    userId: user?.id,
  };
}

async function getCurrentCart(
  sessionCartId: string,
  userId?: string,
): Promise<ParsedCartRow | undefined> {
  const anonymousCart = await prisma.cart.findFirst({
    where: {
      sessionCartId,
      userId: null,
    },
  });

  if (!userId) {
    return anonymousCart ? parseCart(anonymousCart) : undefined;
  }

  const userCart = await prisma.cart.findFirst({
    where: { userId },
  });

  if (!anonymousCart) {
    return userCart ? parseCart(userCart) : undefined;
  }

  if (!userCart) {
    const connectedCart = await prisma.cart.update({
      where: { id: anonymousCart.id },
      data: { userId },
    });

    return parseCart(connectedCart);
  }

  const mergedItems = mergeCartItems(
    parseCart(userCart).items,
    parseCart(anonymousCart).items,
  );

  const updatedUserCart = await prisma.cart.update({
    where: { id: userCart.id },
    data: buildCartData(mergedItems),
  });

  await prisma.cart.delete({
    where: { id: anonymousCart.id },
  });

  return parseCart(updatedUserCart);
}

function parseCart(cart: CartRow): ParsedCartRow {
  return {
    ...cart,
    items: cart.items.map((item) => cartItemSchema.parse(item)),
  };
}

function mergeCartItems(currentItems: CartItem[], incomingItems: CartItem[]) {
  const mergedItems = currentItems.map((item) => ({ ...item }));

  for (const incomingItem of incomingItems) {
    const existingItem = mergedItems.find(
      (item) => item.productId === incomingItem.productId,
    );

    if (existingItem) {
      existingItem.quantity += incomingItem.quantity;
    } else {
      mergedItems.push({ ...incomingItem });
    }
  }

  return mergedItems;
}

function buildCartData(items: CartItem[]) {
  const itemsPrice = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const shippingPrice =
    itemsPrice > FREE_SHIPPING_MIN_PRICE ? 0 : SHIPPING_PRICE;
  const taxPrice = itemsPrice * TAX_RATE;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return {
    items,
    itemsPrice: formatPrice(itemsPrice),
    shippingPrice: formatPrice(shippingPrice),
    taxPrice: formatPrice(taxPrice),
    totalPrice: formatPrice(totalPrice),
  };
}

function formatPrice(value: number) {
  return Number(value.toFixed(2)).toFixed(2);
}
