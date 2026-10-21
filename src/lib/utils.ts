export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatNumber(n: number, digits = 1) {
  return n.toLocaleString("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function formatDelta(n: number, digits = 2) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${formatNumber(n, digits)}`;
}
