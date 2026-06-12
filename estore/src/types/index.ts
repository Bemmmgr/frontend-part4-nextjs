import { z } from "zod";
import { insetProductsSchema } from "@/lib/validators";

// 023 - zod calidation & type inference
export type Product = z.infer<typeof insetProductsSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};
