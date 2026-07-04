import { z } from "zod";
import {
  insetProductsSchema,
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  insertOrderSchema,
  insertOrderItemSchema,
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
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDeilvered: boolean;
  deilveredAt: Date | null;
  orderItems: OrderItem[];
  user: {
    name: string;
    email: string;
  };
};
