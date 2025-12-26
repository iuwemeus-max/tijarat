import { z } from "zod";
import { UAE_EMIRATES } from "../constants";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(5),
  addressLine1: z.string().min(3),
  city: z.string().min(2),
  emirate: z.enum([...(UAE_EMIRATES as [string, ...string[]])]),
  items: z.array(checkoutItemSchema).min(1),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
