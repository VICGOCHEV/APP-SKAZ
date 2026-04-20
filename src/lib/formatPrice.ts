const priceFormatter = new Intl.NumberFormat('ru-RU');

export function formatPrice(value: number): string {
  return `${priceFormatter.format(Math.round(value))} ₽`;
}
