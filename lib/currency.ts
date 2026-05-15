export const DEFAULT_USD_RUB_RATE = 92;

export type DisplayCurrency = "RUB" | "USD";

export async function fetchUsdRubRate(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=RUB",
    );

    if (!response.ok) return DEFAULT_USD_RUB_RATE;

    const data = (await response.json()) as { rates?: { RUB?: number } };
    return data.rates?.RUB ?? DEFAULT_USD_RUB_RATE;
  } catch {
    return DEFAULT_USD_RUB_RATE;
  }
}

export function rubToUsd(amountRub: number, rate: number) {
  return rate > 0 ? amountRub / rate : amountRub;
}

export function usdToRub(amountUsd: number, rate: number) {
  return amountUsd * rate;
}

export function formatMoney(
  amountRub: number,
  currency: DisplayCurrency,
  rate: number,
) {
  const value = currency === "USD" ? rubToUsd(amountRub, rate) : amountRub;

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(value);
}
