import { TFunction } from "i18next";
import { NotificationAlert, NotificationItem, NotificationKind } from "models/notification";

import { formatCurrency, formatQuantity } from "./formatCurrency";
import { formatOptionalNumber } from "./formatEntityId";
import { measurementShort } from "./productUtils";

/** «Просрочено 3 долга клиентов на 4 500 000 UZS», «Заканчиваются 7 товаров», «Сегодня доставить 2 заказа». */
export const alertSentence = (t: TFunction, alert: NotificationAlert): string =>
	t(`notifications.alert.${alert.kind}`, {
		count: alert.count,
		formatted: formatQuantity(alert.count),
		amount: formatCurrency(alert.amount ?? 0),
	});

/** An item's own name — the product, or the document's «№» («Без номера» for an old unnumbered one). */
export const alertItemTitle = (t: TFunction, item: NotificationItem): string =>
	item.entityKind === "Product"
		? (item.label ?? "")
		: formatOptionalNumber(item.label, t("common.noNumber"));

const money = (t: TFunction, value: number): string =>
	`${formatCurrency(value)} ${t("common.unit.uzs")}`;

/** «осталось 1 т, порог 5 т» — or «нет в наличии, порог 10 шт» — in that one warehouse. */
function stockLeft(t: TFunction, item: NotificationItem): string {
	const quantity = item.quantity ?? 0;
	const unit = item.measurement ? measurementShort(t, item.measurement) : "";
	const withUnit = (value: number) => `${formatQuantity(value)} ${unit}`.trim();
	const threshold = withUnit(item.threshold ?? 0);
	return quantity <= 0
		? t("notifications.item.outOfStock", { threshold })
		: t("notifications.item.stockLeft", { qty: withUnit(quantity), threshold });
}

/**
 * The muted rest of an item's line, in the order a shopkeeper reads it: who
 * (the partner / customer), how much, and how late — or, for a low-stock row,
 * the product's SKU, the warehouse and what is left there of its threshold.
 */
export function alertItemDetails(
	t: TFunction,
	kind: NotificationKind,
	item: NotificationItem,
): string[] {
	if (kind === "LowStock") {
		return [item.detail, item.warehouseName, stockLeft(t, item)].filter((part): part is string =>
			Boolean(part),
		);
	}
	const parts: string[] = [];
	if (item.detail) {
		parts.push(item.detail);
	}
	if (item.amount != null) {
		parts.push(money(t, item.amount));
	}
	if (item.days != null && item.days > 0) {
		parts.push(t("notifications.item.daysOverdue", { count: item.days }));
	}
	return parts;
}
