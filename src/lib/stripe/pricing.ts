/** Total booking price in cents. Uses whichever of hourly/daily is cheaper when both are set. */
export function calculateBookingCents(
  startIso: string,
  endIso: string,
  pricePerHour: number | null,
  pricePerDay: number | null
): number | null {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;

  const hours = Math.ceil(ms / 3_600_000);
  const days = Math.ceil(ms / 86_400_000);

  const options: number[] = [];
  if (pricePerHour) options.push(Math.round(hours * pricePerHour * 100));
  if (pricePerDay) options.push(Math.round(days * pricePerDay * 100));
  if (options.length === 0) return null;
  return Math.min(...options);
}

export function platformFeeCents(totalCents: number, percent: number): number {
  return Math.round((totalCents * percent) / 100);
}
