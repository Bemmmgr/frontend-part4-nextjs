import { z } from "zod";
import {
  insetProductsSchema,
  insertCartSchema,
  cartItemSchema,
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
