"use server";

import z from "zod";
import { insertReviewSchema } from "../validators";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

// 140 - create & update Review action
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>,
) {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    //validate and store review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });

    // get the product that is being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) throw new Error("Product not found");

    // check if user already reviewed
    const reviewExist = await prisma.review.findFirst({
      where: { productId: review.productId, userId: review.userId },
    });

    // differen actions
    await prisma.$transaction(async (tx) => {
      if (reviewExist) {
        // update review
        await tx.review.update({
          where: { id: reviewExist.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // create review
        await tx.review.create({ data: review });
      }

      // get avg rating, 聚合函数
      const avgRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      // get number of review
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      // updating rating & numReviews in product table
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: avgRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: "Review updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
