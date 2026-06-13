"use server";

import { prisma } from "@/db/prisma";
import { converToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";

// 021 - load products from database
// Get latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return converToPlainObject(data);
}

// 025 - get single product by slug
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug },
  });
}
