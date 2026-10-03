import { TFunction } from "i18next";
import { Order } from "models/order";
import { Partner } from "models/partner";
import { Measurement } from "models/product";
import { TransactionRecord, TransactionType } from "models/transaction";
import { formatOptionalNumber } from "utils/formatEntityId";
import { discountShortLabel, orderDiscountTotal, orderSubtotal } from "utils/orderUtils";
import { discountLabel, txDiscountTotal, txSubtotal } from "utils/transactionUtils";

/** What a printed invoice («Накладная») documents. */
export type InvoiceKind = TransactionType | "Order";

/** Where an invoice print view loads its document from (the route it lives under). */
export type InvoiceSource = "Sale" | "Supply" | "Order";

export interface InvoiceLine {
	key: number;
	productName: string;
	sku?: string;
	/** Base-unit quantity. */
	quantity: number;
	/** Unit of an order line; transaction lines carry no unit. */
	measurement?: Measurement;
	/** Pack count when the line was entered in packages. */
	packs?: number;
	unitPrice: number;
	/** «−10%» / «−5 000», or null without a discount. */
	discount: string | null;
	/** Served line total after the discount. */
	total: number;
}

/**
 * Everything a printed invoice shows, built from the served sale / supply /
 * refund / order and its partner. Data only — labels resolve when it renders.
 */
export interface InvoiceDocument {
	kind: InvoiceKind;
	/** Served bare document number; null on legacy rows. */
	number: string | null;
	date: Date | string;
	partner: Partner;
	/**
	 * Goods leave the business (sale, supply refund, order) — the business is the
	 * sender; otherwise the partner sends and the business receives.
	 */
	goodsOut: boolean;
	warehouseName: string | null;
	lines: InvoiceLine[];
	subtotal: number;
	discount: number;
	total: number;
	/** Sales and supplies only — a refund moves no money and an order is not paid yet. */
	payment: { paid: number; remaining: number } | null;
	/** Refunds: the original document's number and the reason. */
	originalNumber: string | null;
	refundReason: string | null;
	notes: string | null;
	/** Orders: the requested delivery. */
	delivery: { date: string | null; time: string | null; address: string | null } | null;
}

const GOODS_OUT: Record<InvoiceKind, boolean> = {
	Sale: true,
	SupplyRefund: true,
	Order: true,
	Supply: false,
	SaleRefund: false,
};

const isRefund = (kind: InvoiceKind): boolean => kind === "SaleRefund" || kind === "SupplyRefund";

/** «Накладная на продажу №12» — the document title on paper and in the print toolbar. */
export const invoiceTitle = (t: TFunction, doc: Pick<InvoiceDocument, "kind" | "number">): string =>
	t(`print.invoice.title.${doc.kind}`, {
		number: formatOptionalNumber(doc.number, t("print.noNumber")),
	});

export function invoiceFromTransaction(tx: TransactionRecord, partner: Partner): InvoiceDocument {
	return {
		kind: tx.type,
		number: tx.transactionNumber ?? null,
		date: tx.date,
		partner,
		goodsOut: GOODS_OUT[tx.type],
		warehouseName: tx.warehouseName ?? null,
		lines: tx.lines.map((line) => ({
			key: line.id,
			productName: line.productName,
			quantity: line.quantity,
			packs:
				line.packageSize && line.packageSize > 0
					? Math.round(line.quantity / line.packageSize)
					: undefined,
			unitPrice: line.unitPrice,
			discount: discountLabel(line),
			total: line.total,
		})),
		subtotal: txSubtotal(tx.lines),
		discount: txDiscountTotal(tx.lines),
		total: tx.totalDue,
		payment: isRefund(tx.type)
			? null
			: {
					paid: tx.totalPaid,
					remaining: tx.remaining ?? Math.max(tx.totalDue - tx.totalPaid, 0),
				},
		originalNumber: tx.originalTransactionNumber ?? null,
		refundReason: tx.refundReason ?? null,
		notes: tx.notes ?? null,
		delivery: null,
	};
}

export function invoiceFromOrder(order: Order, partner: Partner): InvoiceDocument {
	return {
		kind: "Order",
		number: order.orderNumber,
		date: order.date,
		partner,
		goodsOut: true,
		warehouseName: order.warehouseName,
		lines: order.lines.map((line) => ({
			key: line.id,
			productName: line.productName,
			sku: line.sku,
			quantity: line.quantity,
			measurement: line.measurement,
			unitPrice: line.unitPrice,
			discount: discountShortLabel(line),
			total: line.total,
		})),
		subtotal: orderSubtotal(order.lines),
		discount: orderDiscountTotal(order.lines),
		total: order.total,
		payment: null,
		originalNumber: null,
		refundReason: null,
		notes: order.notes,
		delivery:
			order.deliveryDate || order.deliveryAddress
				? { date: order.deliveryDate, time: order.deliveryTime, address: order.deliveryAddress }
				: null,
	};
}
