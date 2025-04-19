/**
 * Форматирует число в UZS с сокращением:
 * - ≥1 000 000 → "X,Y млн UZS"
 * - ≥1 000     → "X,Y тыс UZS"
 * - иначе     → "N UZS"
 */
export function formatUZS(value: number): string {
    if (value >= 1_000_000) {
      const mln = value / 1_000_000;
      const fixed = mln.toFixed(1);
      const formatted = fixed.endsWith('.0')
        ? Number(mln.toFixed(0)).toLocaleString('ru-RU')
        : parseFloat(fixed).toLocaleString('ru-RU');
      return `${formatted} млн`;
    } else if (value >= 1_000) {
      const k = value / 1_000;
      const fixed = k.toFixed(1);
      const formatted = fixed.endsWith('.0')
        ? Number(k.toFixed(0)).toLocaleString('ru-RU')
        : parseFloat(fixed).toLocaleString('ru-RU');
      return `${formatted} тыс`;
    } else {
      return `${value.toLocaleString('ru-RU')}`;
    }
  }
  