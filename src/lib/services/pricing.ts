import { DELIVERY_FLAT_FEE, DELIVERY_FREE_QUANTITY_THRESHOLD } from "../constants";

export function calculateDeliveryFee(totalQuantity: number) {
  if (totalQuantity >= DELIVERY_FREE_QUANTITY_THRESHOLD) return 0;
  return DELIVERY_FLAT_FEE;
}

export function calculateTotals(items: { quantity: number; unitPrice: number }[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(totalQuantity);
  const total = subtotal + deliveryFee;
  return { subtotal, totalQuantity, deliveryFee, total };
}
