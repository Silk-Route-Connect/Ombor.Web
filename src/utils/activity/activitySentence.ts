import { TFunction } from "i18next";
import {
	ACTIVITY_RECORD_KINDS,
	ActivityChange,
	ActivityEntityKind,
	ActivityFieldChange,
	ActivityItem,
	ActivityRecord,
	ActivityValue,
} from "models/activity";
import { formatEntityId, hasEntityNumber } from "utils/formatEntityId";

import {
	activityFieldLabel,
	ARCHIVE_FIELD,
	formatActivityValue,
	inlineFieldLabel,
	PASSWORD_FIELD,
} from "./activityFields";
import { activityRecordPath } from "./activityLinks";

/** The record a sentence names, with its page when it has one. */
export interface ActivityRef {
	text: string;
	to?: string;
}

/** One operation as one plain sentence: «Продажа №42 проведена — Азиз». */
export interface ActivitySentence {
	/** Text before the record («Продажа »). */
	before: string;
	ref: ActivityRef;
	/** Text after it, with the tail: « проведена — Азиз», « изменён: цена продажи 12 000 → 13 000». */
	after: string;
}

const NUMBERED_KINDS = new Set<ActivityEntityKind>([
	"Sale",
	"Supply",
	"SaleRefund",
	"SupplyRefund",
	"Payment",
	"Payroll",
	"Order",
]);
// Their lists show the id as the number.
const ID_NUMBERED_KINDS = new Set<ActivityEntityKind>(["Adjustment", "Transfer", "WalletTransfer"]);

const INLINE_VALUE_MAX = 40;

/** The operation's own record among its changes (served first, matched by kind and id). */
export const findPrimaryChange = (item: ActivityItem): ActivityChange | undefined =>
	item.changes.find(
		(c) => c.entityKind === item.primary.entityKind && c.entityId === item.primary.entityId,
	);

export const findField = (
	change: ActivityChange | undefined,
	field: string,
): ActivityFieldChange | undefined => change?.fields.find((f) => f.field === field);

/** The value as the record stands after the operation (or stood, when it was deleted). */
export const currentValue = (field: ActivityFieldChange | undefined): ActivityValue | undefined =>
	field?.new ?? field?.old;

/**
 * «№42» for documents (or «без номера»), «№7» for id-numbered events, «Сахар»
 * in quotes for named records; a settled document's number for a payment's
 * allocation, nothing for an unnamed part (an order status event, an advance).
 */
export function activityRefText(t: TFunction, record: ActivityRecord): string {
	const { entityKind, label } = record;
	if (NUMBERED_KINDS.has(entityKind)) {
		return hasEntityNumber(label) ? formatEntityId(label) : t("activity.noNumber");
	}
	if (ID_NUMBERED_KINDS.has(entityKind)) {
		return formatEntityId(label || record.entityId);
	}
	if (entityKind === "PaymentAllocation") {
		return hasEntityNumber(label) ? formatEntityId(label) : "";
	}
	if (label) {
		return t("activity.quoted", { name: label });
	}
	return (ACTIVITY_RECORD_KINDS as readonly string[]).includes(entityKind)
		? t("activity.unnamed")
		: "";
}

const clip = (text: string): string =>
	text.length > INLINE_VALUE_MAX ? `${text.slice(0, INLINE_VALUE_MAX - 1)}…` : text;

function shownValue(
	t: TFunction,
	kind: ActivityEntityKind,
	field: string,
	value: ActivityValue | undefined,
): string {
	return clip(formatActivityValue(t, kind, field, value) ?? t("common.dash"));
}

function counterparty(t: TFunction, change: ActivityChange | undefined, field: string): string {
	const name = currentValue(findField(change, field));
	return typeof name === "string" && name !== "" ? t("activity.detail.counterparty", { name }) : "";
}

function route(t: TFunction, change: ActivityChange | undefined, from: string, to: string): string {
	if (!change) {
		return "";
	}
	const kind = change.entityKind;
	const source = formatActivityValue(t, kind, from, currentValue(findField(change, from)));
	const target = formatActivityValue(t, kind, to, currentValue(findField(change, to)));
	return source && target ? t("activity.detail.route", { from: source, to: target }) : "";
}

function productQuantity(t: TFunction, change: ActivityChange | undefined, key: string): string {
	if (!change) {
		return "";
	}
	const value = (field: string) =>
		formatActivityValue(t, change.entityKind, field, currentValue(findField(change, field))) ?? "";
	return t(key, {
		product: value("product"),
		quantity: value("quantity"),
		warehouse: value("warehouse"),
	});
}

function statusChange(t: TFunction, item: ActivityItem, order: ActivityChange | undefined): string {
	const status = findField(order, "status");
	const event = item.changes.find((c) => c.entityKind === "OrderStatusEvent");
	// Both the order's status and its status event hold OrderStatus names.
	const before = status ? status.old : currentValue(findField(event, "from"));
	const after = status ? status.new : currentValue(findField(event, "to"));
	if (before === undefined && after === undefined) {
		return "";
	}
	return t("activity.detail.status", {
		from: shownValue(t, "Order", "status", before),
		to: shownValue(t, "Order", "status", after),
	});
}

/** «: цена продажи 12 000 → 13 000 и ещё 2 поля» — the headline field of an edit (a document's status first). */
function changeSummary(t: TFunction, change: ActivityChange | undefined): string {
	const fields = change?.fields.filter((f) => f.field !== ARCHIVE_FIELD) ?? [];
	const lead = fields.find((f) => f.field === "status") ?? fields[0];
	if (!change || !lead) {
		return "";
	}
	const head =
		lead.field === PASSWORD_FIELD
			? t("activity.detail.password")
			: t("activity.detail.change", {
					field: inlineFieldLabel(activityFieldLabel(t, change.entityKind, lead.field)),
					old: shownValue(t, change.entityKind, lead.field, lead.old),
					new: shownValue(t, change.entityKind, lead.field, lead.new),
				});
	const rest = fields.length - 1;
	return rest > 0 ? `${head} ${t("activity.detail.more", { count: rest })}` : head;
}

function sentenceKey(item: ActivityItem, primary: ActivityChange | undefined): string {
	const base = `activity.sentence.${item.kind}`;
	if (item.kind === "AdjustmentCreated") {
		const direction = currentValue(findField(primary, "direction"));
		return direction === "Increase" || direction === "Decrease" ? `${base}.${direction}` : base;
	}
	if (item.kind === "UserUpdated") {
		const active = findField(primary, "isActive");
		if (active?.new === false) {
			return `${base}.deactivated`;
		}
		if (active?.new === true) {
			return `${base}.reactivated`;
		}
		if (primary?.fields.length === 1 && primary.fields[0]?.field === PASSWORD_FIELD) {
			return `${base}.password`;
		}
	}
	return base;
}

function sentenceDetail(
	t: TFunction,
	item: ActivityItem,
	primary: ActivityChange | undefined,
): string {
	switch (item.kind) {
		case "SaleCreated":
		case "SupplyCreated":
		case "SaleRefundCreated":
		case "SupplyRefundCreated":
		case "PaymentCreated":
			return counterparty(t, primary, "partner");
		case "PayrollPaid":
			return counterparty(t, primary, "employee");
		case "OrderCreated":
			return counterparty(t, primary, "customer");
		case "AdjustmentCreated":
			return productQuantity(t, primary, "activity.detail.adjustment");
		case "OpeningStockCreated":
			return productQuantity(t, primary, "activity.detail.openingStock");
		case "TransferCreated":
			return route(t, primary, "fromWarehouse", "toWarehouse");
		case "WalletTransferCreated":
			return route(t, primary, "fromWallet", "toWallet");
		case "OrderStatusChanged":
			return statusChange(t, item, primary);
		default:
			return item.kind.endsWith("Updated") ? changeSummary(t, primary) : "";
	}
}

// Stands in for the record while the sentence is translated, so names never pass through the template.
const REF_SLOT = "\u0000";

/**
 * The sentence of an operation (owner decision: one plain sentence per kind,
 * with the record as a link): the text around the record and the tail with the
 * counterparty, the route or the edited field.
 */
export function buildActivitySentence(t: TFunction, item: ActivityItem): ActivitySentence {
	const primary = findPrimaryChange(item);
	const preferred = sentenceKey(item, primary);
	const known = t(preferred, { defaultValue: "" }) !== "";
	const key = known ? preferred : "activity.sentence.Other";
	// A user's deactivation or password change says it all in the sentence itself.
	const selfContained =
		item.kind === "UserUpdated" && preferred !== `activity.sentence.${item.kind}`;
	const detail = known && !selfContained ? sentenceDetail(t, item, primary) : "";
	const [before = "", after = ""] = t(key, { ref: REF_SLOT }).split(REF_SLOT);

	return {
		before,
		ref: {
			text: activityRefText(t, item.primary),
			to: item.kind.endsWith("Deleted") ? undefined : activityRecordPath(item.primary),
		},
		after: after + detail,
	};
}
