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

function stockLeft(t: TFunction, item: NotificationItem): string {
	const quantity = item.quantity ?? 0;
	if (quantity <= 0) {
		return t("notifications.item.outOfStock");
	}
	const unit = item.measurement ? measurementShort(t, item.measurement) : "";
	return t("notifications.item.stockLeft", {
		qty: `${formatQuantity(quantity)} ${unit}`.trim(),
		min: formatQuantity(item.threshold ?? 0),
	});
}

/**
 * The muted rest of an item's line, in the order a shopkeeper reads it: who
 * (the partner / customer), how much, and how late — or, for a product, its SKU
 * and what is left of the minimum.
 */
export function alertItemDetails(
	t: TFunction,
	kind: NotificationKind,
	item: NotificationItem,
): string[] {
	if (kind === "LowStock") {
		return [item.detail, stockLeft(t, item)].filter((part): part is string => Boolean(part));
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
