"use server";

import z from "zod";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { insetProductsSchema, updateProductSchema } from "../validators";
import { converToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { Prisma } from "@/generated/prisma/client";

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

// 115 - get single product by id
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: { id: productId },
  });

  return converToPlainObject(data);
}

// 104 - get products for admin action
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
}) {
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== "all" ? { category } : {};

  const where = {
    ...queryFilter,
    ...categoryFilter,
  };

  const data = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({ where });

  return {
    data,
    totalPage: Math.ceil(dataCount / limit),
  };
}

// 106 - delete a product
export async function deleteProduct(id: string) {
  try {
    const productExist = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExist) throw new Error("Product not found");

    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// 107 - create a product
export async function createProduct(data: z.infer<typeof insetProductsSchema>) {
  try {
    const product = insetProductsSchema.parse(data);
    await prisma.product.create({ data: product });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// 107 - update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const productExist = prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!productExist) throw new Error("Product not found");

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// 126 - get all categories
export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return data;
}
