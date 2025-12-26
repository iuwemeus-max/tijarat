import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["IN", "OUT", "ADJUST", "RETURN"]),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
