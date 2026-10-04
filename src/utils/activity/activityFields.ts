import { TFunction } from "i18next";
import { ActivityEntityKind, ActivityValue } from "models/activity";
import { formatDate, formatDateTime } from "utils/dateUtils";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import { formatPartnerBalance } from "utils/partnerUtils";
import { formatPeriod } from "utils/payrollUtils";
import { formatUzPhone } from "utils/phoneUtils";

/** The masked secret on a user: recorded by name only, never with values. */
export const PASSWORD_FIELD = "password";

/** The flag whose flip the server records as an archive / restore. */
export const ARCHIVE_FIELD = "isArchived";

/**
 * Field labels and enum values are shared by the kinds that store the same
 * columns: every transaction kind is one record type, and so is every payment.
 */
const FIELD_GROUP: Partial<Record<ActivityEntityKind, string>> = {
	Sale: "Transaction",
	Supply: "Transaction",
	SaleRefund: "Transaction",
	SupplyRefund: "Transaction",
	Payment: "Payment",
	Payroll: "Payment",
};

const groupOf = (kind: ActivityEntityKind): string => FIELD_GROUP[kind] ?? kind;

// A legacy column the server still records but no screen shows or edits — «Розничная цена 0» would only confuse.
const HIDDEN_FIELDS = new Set(["Product.retailPrice"]);
// 0 is «not set» here, as the product page reads it («—»): no minimum, no packaging.
const ZERO_IS_EMPTY_FIELDS = new Set(["Product.lowStockThreshold", "Product.packaging.size"]);

/** A recorded field the log leaves out of the tables and the edit summary. */
export const isHiddenActivityField = (kind: ActivityEntityKind, field: string): boolean =>
	HIDDEN_FIELDS.has(`${groupOf(kind)}.${field}`);

const MONEY_FIELDS = new Set([
	"totalDue",
	"totalPaid",
	"totalAmount",
	"amount",
	"salePrice",
	"supplyPrice",
	"unitPrice",
	"unitCost",
	"averageCost",
	"salary",
	"openingBalance",
]);
const DATE_FIELDS = new Set(["openingDate", "dueDate", "deliveryDate", "dateOfEmployment"]);
const DOCUMENT_NUMBER_FIELDS = new Set(["number", "orderNumber"]);
// References the server resolves to a document number (or a name); a raw number left means the record is gone.
const DOCUMENT_REF_FIELDS = new Set(["transaction", "originalTransaction", "sale"]);
const NAME_REF_FIELDS = new Set([
	"partner",
	"customer",
	"product",
	"category",
	"employee",
	"warehouse",
	"fromWarehouse",
	"toWarehouse",
	"wallet",
	"fromWallet",
	"toWallet",
]);
const PHONE_FIELDS = new Set(["phoneNumbers", "contactInfo.phoneNumbers", "phoneNumber"]);

const ENUM_VALUE_KEYS: Record<string, (value: string) => string> = {
	"Transaction.type": (v) => `transaction.type.${v}`,
	"Transaction.status": (v) => `transaction.statusShort.${v}`,
	"Payment.type": (v) => `payment.type.${v}`,
	"Payment.direction": (v) => `payment.direction.${v}`,
	"Adjustment.direction": (v) => `adjustment.direction.${v}`,
	"Adjustment.reason": (v) => `adjustment.reason.${v}`,
	"Product.type": (v) => `product.type.${v}`,
	"Product.measurement": (v) => `product.measurement.${v}`,
	"Partner.type": (v) => `partner.type.${v}`,
	"Wallet.type": (v) => `wallet.type.${v.toLowerCase()}`,
	"Template.type": (v) => `template.type.${v}`,
	"Employee.status": (v) => `employee.status.${v}`,
	"Order.status": (v) => `order.status.${v}`,
	"Order.source": (v) => `order.source.${v}`,
	"OrderStatusEvent.from": (v) => `order.status.${v}`,
	"OrderStatusEvent.to": (v) => `order.status.${v}`,
	"TransactionLine.discountType": (v) => `activity.value.discountType.${v}`,
	"OrderLine.discountType": (v) => `activity.value.discountType.${v}`,
	"TemplateItem.discountType": (v) => `activity.value.discountType.${v}`,
	"PaymentComponent.sourceType": (v) => `activity.value.sourceType.${v}`,
	"PaymentAllocation.type": (v) => `activity.value.allocationType.${v}`,
};

/** «salePrice» → «Sale price», «contactInfo.email» → «Contact info · email» — for a field no key names yet. */
export function humanizeFieldName(field: string): string {
	const text = field
		.split(".")
		.map((part) => part.replace(/([a-z\d])([A-Z])/g, "$1 $2").toLowerCase())
		.join(" · ");
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * The localized name of a recorded field: a kind-specific key
 * (`activity.field.Product.type` «Тип товара»), then the shared one
 * (`activity.field.name`), then the humanized property name.
 */
export function activityFieldLabel(t: TFunction, kind: ActivityEntityKind, field: string): string {
	return (
		t(`activity.field.${groupOf(kind)}.${field}`, { defaultValue: "" }) ||
		t(`activity.field.${field}`, { defaultValue: "" }) ||
		humanizeFieldName(field)
	);
}

/** A field label inside a sentence: «цена продажи», but «Telegram» stays as written. */
export function inlineFieldLabel(label: string): string {
	return /^[А-ЯЁ][а-яё]/.test(label) ? label.charAt(0).toLowerCase() + label.slice(1) : label;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;
const TIME_OF_DAY = /^\d{2}:\d{2}(:\d{2})?/;

function formatScalar(
	t: TFunction,
	kind: ActivityEntityKind,
	field: string,
	value: string | number | boolean,
): string {
	if (typeof value === "boolean") {
		return t(value ? "activity.value.yes" : "activity.value.no");
	}

	if (NAME_REF_FIELDS.has(field) || DOCUMENT_REF_FIELDS.has(field)) {
		if (typeof value === "number") {
			return t("activity.value.deletedRecord");
		}
		return DOCUMENT_REF_FIELDS.has(field) ? formatEntityId(value) : value;
	}

	const enumKey = ENUM_VALUE_KEYS[`${groupOf(kind)}.${field}`];
	if (enumKey && typeof value === "string") {
		return t(enumKey(value), { defaultValue: value });
	}

	if (typeof value === "number") {
		if (kind === "Partner" && field === "openingBalance") {
			return formatPartnerBalance(value);
		}
		if (MONEY_FIELDS.has(field)) {
			return formatCurrency(value);
		}
		return DOCUMENT_NUMBER_FIELDS.has(field) ? formatEntityId(value) : formatQuantity(value);
	}

	if (DOCUMENT_NUMBER_FIELDS.has(field)) {
		return formatEntityId(value);
	}
	if (PHONE_FIELDS.has(field)) {
		return formatUzPhone(value) || value;
	}
	if (field === "period") {
		return formatPeriod(t, value);
	}
	if (field === "deliveryTime" && TIME_OF_DAY.test(value)) {
		return value.slice(0, 5);
	}
	if (DATE_FIELDS.has(field) || ISO_DATE.test(value)) {
		return formatDate(value) || value;
	}
	if (ISO_DATE_TIME.test(value)) {
		return formatDateTime(value) || value;
	}
	return value;
}

/**
 * A recorded value as the screen reads it — money, dates, enums, phones and
 * references through the shared formatters; `null` when the value is empty
 * (the caller shows «—»).
 */
export function formatActivityValue(
	t: TFunction,
	kind: ActivityEntityKind,
	field: string,
	value: ActivityValue | undefined,
): string | null {
	if (value === undefined || value === null || value === "") {
		return null;
	}
	if (value === 0 && ZERO_IS_EMPTY_FIELDS.has(`${groupOf(kind)}.${field}`)) {
		return null;
	}
	if (Array.isArray(value)) {
		const parts = value
			.map((part) => formatActivityValue(t, kind, field, part))
			.filter((part): part is string => part !== null);
		return parts.length > 0 ? parts.join(", ") : null;
	}
	if (typeof value === "object") {
		return JSON.stringify(value);
	}
	return formatScalar(t, kind, field, value);
}
