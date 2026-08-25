/** Formats a number as Naira with 2 decimal places, e.g. formatNaira(23750) -> "₦23,750.00" */
export const formatNaira = (amount: number): string =>
  `₦${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
