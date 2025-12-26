import { z } from "zod";

export const productInput = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  active: z.boolean().optional().default(true),
  description: z.string().optional(),
});

export type ProductInput = z.infer<typeof productInput>;
