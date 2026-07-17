import { useEffect, useMemo, useState } from "react";
import { Partner } from "models/partner";
import { OutstandingTransaction, SettlementInput } from "models/payment";
import { Product } from "models/product";
import {
	CreateTransactionEntryRequest,
	OverpaymentDisposition,
	TransactionLineDiscountType,
} from "models/transaction";
import PaymentApi from "services/api/PaymentApi";
import { lineGross, lineNet, TransactionDirection } from "utils/transactionUtils";

/** A single product line in the cart (the product snapshot drives stock + unit). */
export type CartItem = {
	product: Product;
	quantity: number;
	unitPrice: number;
	/** Percent (0–100) when discountType is "Percentage"; a per-line currency amount when "Fixed". */
	discountValue: number;
	discountType: TransactionLineDiscountType;
	/**
	 * Entry-only unit mode: the qty field edits package counts (packaging.size base
	 * units each) while quantity stays base units (rule 21). Never sent — the create
	 * contract has no pack field, so the entered pack count is not persisted (F21).
	 */
	inPackages?: boolean;
};

/** Tendered payment — a single wallet + amount (business-rules §B source side). */
export type TenderPayment = { walletId: number | null; amount: number };

/** Derived payment state of the tender against the transaction total. */
export type PayState = "none" | "partial" | "full" | "over";

/** On-hand quantity of a product at a warehouse (from the served inventory items). */
export const stockAt = (product: Product, warehouseId: number | null): number => {
	if (warehouseId == null) {
		return 0;
	}
	return product.warehouseItems.find((i) => i.warehouseId === warehouseId)?.quantity ?? 0;
};

/** Line math mirrors utils/transactionUtils so the created record reconciles on the detail. */
const itemLine = (it: CartItem) => ({
	quantity: it.quantity,
	unitPrice: it.unitPrice,
	discount: it.discountValue,
	discountType: it.discountType,
});

export interface UseTransactionEntry {
	direction: TransactionDirection;
	partner: Partner | null;
	warehouseId: number | null;
	items: CartItem[];
	notes: string;
	attachments: File[];
	pay: TenderPayment;
	settleAlloc: SettlementInput[];
	overChoice: OverpaymentDisposition;
	tried: boolean;
	outstanding: OutstandingTransaction[];

	// derived
	inCart: Set<number>;
	count: number;
	subtotal: number;
	discTotal: number;
	total: number;
	paid: number;
	remaining: number;
	overExcess: number;
	payState: PayState;
	debtsTotal: number;
	settledSum: number;
	allDebtsSettled: boolean;
	leftover: number;
	useAdvance: boolean;
	advanceSum: number;
	changeSum: number;
	balanceAfter: number;
	hasStockError: boolean;
	valid: boolean;
	dirty: boolean;

	// line helpers
	lineDiscount(it: CartItem): number;
	lineTotal(it: CartItem): number;

	// actions
	setPartner(partner: Partner | null): void;
	setWarehouseId(id: number | null): void;
	addProduct(product: Product): void;
	updateItem(index: number, patch: Partial<CartItem>): void;
	removeItem(index: number): void;
	clearItems(): void;
	applyBulk(pct: number): void;
	loadItems(items: CartItem[]): void;
	setNotes(notes: string): void;
	addFiles(files: FileList): void;
	removeFile(index: number): void;
	setPay(pay: TenderPayment): void;
	setSettleAlloc(alloc: SettlementInput[]): void;
	setOverChoice(choice: OverpaymentDisposition): void;
	setTried(tried: boolean): void;
	buildPayload(): CreateTransactionEntryRequest;
}

/**
 * State + money math for the redesigned POS New Sale / New Supply screen, shared
 * by both directions. Owns the cart, the single-wallet tender, and the
 * overpayment disposition (settle other open transactions → change → advance,
 * business-rules §B + rule 40). Deltas by direction: line price seeds from the
 * sale vs supply price; a Sale hard-blocks over-stock while a Supply (which adds
 * stock) does not; the partner-balance projection flips sign — a Sale increases
 * what the partner owes us, a Supply increases what we owe them.
 */
export function useTransactionEntry(direction: TransactionDirection): UseTransactionEntry {
	const isSale = direction === "Sale";

	const [partner, setPartnerState] = useState<Partner | null>(null);
	const [warehouseId, setWarehouseId] = useState<number | null>(null);
	const [items, setItems] = useState<CartItem[]>([]);
	const [notes, setNotes] = useState("");
	const [attachments, setAttachments] = useState<File[]>([]);
	const [pay, setPay] = useState<TenderPayment>({ walletId: null, amount: 0 });
	const [settleAlloc, setSettleAlloc] = useState<SettlementInput[]>([]);
	const [overChoice, setOverChoice] = useState<OverpaymentDisposition>("change");
	const [tried, setTried] = useState(false);
	const [outstanding, setOutstanding] = useState<OutstandingTransaction[]>([]);

	// Reset the excess disposition whenever the partner changes, then load their
	// open transactions for the settlement modal.
	useEffect(() => {
		setSettleAlloc([]);
		setOverChoice("change");
		if (!partner) {
			setOutstanding([]);
			return;
		}
		let cancelled = false;
		PaymentApi.getOutstanding(partner.id)
			.then((rows) => {
				if (!cancelled) {
					setOutstanding(rows);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setOutstanding([]);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [partner]);

	const setPartner = (next: Partner | null) => setPartnerState(next);

	const inCart = useMemo(() => new Set(items.map((i) => i.product.id)), [items]);

	const lineTotal = (it: CartItem): number => Math.max(0, lineNet(itemLine(it)));
	const lineDiscount = (it: CartItem): number => lineGross(itemLine(it)) - lineTotal(it);

	// Line price seeds from the sale price (Sale) or the supply / cost price (Supply).
	const defaultPrice = (product: Product) => (isSale ? product.salePrice : product.supplyPrice);

	const addProduct = (product: Product) => {
		setItems((cur) => {
			const existing = cur.find((x) => x.product.id === product.id);
			if (existing) {
				// Re-adding steps one display unit — a whole package when the line counts in packages.
				const step =
					existing.inPackages && existing.product.packaging ? existing.product.packaging.size : 1;
				return cur.map((x) =>
					x.product.id === product.id ? { ...x, quantity: x.quantity + step } : x,
				);
			}
			return [
				...cur,
				{
					product,
					quantity: 1,
					unitPrice: defaultPrice(product),
					discountValue: 0,
					discountType: "Percentage",
				},
			];
		});
	};

	const updateItem = (index: number, patch: Partial<CartItem>) =>
		setItems((cur) => cur.map((it, j) => (j === index ? { ...it, ...patch } : it)));

	const removeItem = (index: number) => setItems((cur) => cur.filter((_, j) => j !== index));

	const clearItems = () => setItems([]);

	const applyBulk = (pct: number) =>
		setItems((cur) => cur.map((it) => ({ ...it, discountType: "Percentage", discountValue: pct })));

	const loadItems = (next: CartItem[]) => setItems(next);

	const addFiles = (files: FileList) => setAttachments((cur) => [...cur, ...Array.from(files)]);

	const removeFile = (index: number) => setAttachments((cur) => cur.filter((_, j) => j !== index));

	// ── money math ──
	const count = items.length;
	const subtotal = items.reduce((s, it) => s + lineGross(itemLine(it)), 0);
	const total = items.reduce((s, it) => s + lineTotal(it), 0);
	const discTotal = subtotal - total;

	const paid = Math.max(0, pay.amount);
	const remaining = Math.max(0, total - paid);
	const overExcess = Math.max(0, paid - total);
	const payState: PayState =
		paid === 0 ? "none" : paid < total ? "partial" : paid === total ? "full" : "over";

	const debtsTotal = outstanding.reduce((s, o) => s + Math.max(0, o.remaining), 0);
	const settledSum = Math.min(
		settleAlloc.reduce((s, a) => s + a.amount, 0),
		overExcess,
	);
	const debtRemainingAfter = Math.max(0, debtsTotal - settledSum);
	const allDebtsSettled = outstanding.length === 0 || debtRemainingAfter === 0;
	const leftover = Math.max(0, overExcess - settledSum);
	const useAdvance = payState === "over" && allDebtsSettled && overChoice === "advance";
	const advanceSum = useAdvance ? leftover : 0;
	const changeSum = payState === "over" && !useAdvance ? leftover : 0;
	const balanceApplied = Math.min(paid, total) + settledSum + advanceSum;
	// A Sale increases what the partner owes us (+); a Supply increases what we owe (−).
	const balanceDelta = (isSale ? 1 : -1) * (total - balanceApplied);
	const balanceAfter = partner ? partner.balance + balanceDelta : 0;

	// Sales hard-block over-stock (rule 20); a Supply adds stock, so any qty is valid.
	const hasStockError =
		isSale && items.some((it) => it.quantity > stockAt(it.product, warehouseId));
	const valid = Boolean(partner) && items.length > 0 && !hasStockError;
	const dirty = items.length > 0 || notes.trim().length > 0 || attachments.length > 0;

	const buildPayload = (): CreateTransactionEntryRequest => ({
		type: direction,
		partnerId: partner?.id ?? 0,
		warehouseId: warehouseId ?? 0,
		lines: items.map((it) => ({
			productId: it.product.id,
			quantity: it.quantity,
			unitPrice: it.unitPrice,
			discount: it.discountValue,
			discountType: it.discountType,
		})),
		notes: notes.trim() || undefined,
		walletId: pay.walletId ?? 0,
		paidAmount: paid,
		settlements: settleAlloc.filter((a) => a.amount > 0),
		overpayment: useAdvance ? "advance" : "change",
		attachments,
	});

	return {
		direction,
		partner,
		warehouseId,
		items,
		notes,
		attachments,
		pay,
		settleAlloc,
		overChoice,
		tried,
		outstanding,
		inCart,
		count,
		subtotal,
		discTotal,
		total,
		paid,
		remaining,
		overExcess,
		payState,
		debtsTotal,
		settledSum,
		allDebtsSettled,
		leftover,
		useAdvance,
		advanceSum,
		changeSum,
		balanceAfter,
		hasStockError,
		valid,
		dirty,
		lineDiscount,
		lineTotal,
		setPartner,
		setWarehouseId,
		addProduct,
		updateItem,
		removeItem,
		clearItems,
		applyBulk,
		loadItems,
		setNotes,
		addFiles,
		removeFile,
		setPay,
		setSettleAlloc,
		setOverChoice,
		setTried,
		buildPayload,
	};
}

export default useTransactionEntry;
