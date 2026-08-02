import { z } from "zod";
import {
  insetProductsSchema,
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  paymentresultSchema,
  insertReviewSchema,
} from "@/lib/validators";

// 023 - zod calidation & type inference
export type Product = z.infer<typeof insetProductsSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};

// 045 - infer types of cart
export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

// 059 - infer types of order & orderItems
export type OrderItem = Omit<
  z.infer<typeof insertOrderItemSchema>,
  "quantity"
> & {
  orderId: string;
  qty: number;
};

export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderItems: OrderItem[];
  user: {
    name: string;
    email: string;
  };
};

// 082
export type PaymentResult = z.infer<typeof paymentresultSchema>;

// 137 - review type
export type Review = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user?: { name: string };
};
