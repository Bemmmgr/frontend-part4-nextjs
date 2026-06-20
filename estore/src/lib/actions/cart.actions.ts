"use server";

import { CartItem } from "@/types";
import { success } from "zod";

// 046 - add to cart actions
export async function addItemToCart(data: CartItem) {
  return { success: true, message: "Item added to cart successfully" };
}
