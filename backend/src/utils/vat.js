export const VAT_RATE = 0.2;

// All money is handled in integer pence throughout the backend to avoid
// floating-point rounding errors; only the app layers format it as £.
export function calculateTotals(items) {
  const subtotalPence = items.reduce((sum, item) => sum + item.qty * item.unitPricePence, 0);
  const vatPence = Math.round(subtotalPence * VAT_RATE);
  const totalPence = subtotalPence + vatPence;
  return { subtotalPence, vatPence, totalPence };
}
