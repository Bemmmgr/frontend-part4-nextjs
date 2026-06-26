"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { CartItem } from "@/types";
import { converToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";

import {
  CART_COOKIE,
  CART_MAX_AGE,
  FREE_SHIPPING_MIN_PRICE,
  SHIPPING_PRICE,
  TAX_RATE,
} from "../constants";

type CartRow = NonNullable<Awaited<ReturnType<typeof prisma.cart.findFirst>>>;
type ParsedCartRow = Omit<CartRow, "items"> & { items: CartItem[] };

// 049 - price Calc
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
  );
  const shippingPrice = round2(
    itemsPrice > FREE_SHIPPING_MIN_PRICE ? 0 : SHIPPING_PRICE,
  );
  const taxPrice = round2(TAX_RATE * itemsPrice);
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

// 046 - add to cart actions
export async function addItemToCart(data: CartItem) {
  try {
    // parse and validate item
    const item = cartItemSchema.parse(data);

    // check for cart cookie and current user
    const { sessionCartId, userId } = await getCartContext({
      createCartCookie: true,
    });

    if (!sessionCartId) {
      throw new Error("Cart session not found");
    }

    // find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    if (!product) throw new Error("Product not found");

    // TODO: Build the cart item from database product data before checkout.
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

    if (cart) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items,
          ...calcPrice(items),
        },
      });
    } else {
      const newCart = insertCartSchema.parse({
        userId,
        items,
        sessionCartId,
        ...calcPrice(items),
      });

      await prisma.cart.create({
        data: newCart,
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

  if (!sessionCartId) return undefined;

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

async function getCartContext({
  createCartCookie = false,
}: {
  createCartCookie?: boolean;
} = {}) {
  const cookieStore = await cookies();
  let sessionCartId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionCartId && createCartCookie) {
    sessionCartId = crypto.randomUUID();
    cookieStore.set(CART_COOKIE, sessionCartId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: CART_MAX_AGE,
    });
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
  // TODO: Add Cart unique constraints, then replace findFirst with findUnique/upsert.
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

  // TODO: Validate merged quantities against product stock when merge rules are finalized.
  const mergedItems = mergeCartItems(
    parseCart(userCart).items,
    parseCart(anonymousCart).items,
  );

  const updatedUserCart = await prisma.cart.update({
    where: { id: userCart.id },
    data: {
      items: mergedItems,
      ...calcPrice(mergedItems),
    },
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
