/* -------------------------------------------------------------------------- */
/*  useTransactionForm – create / edit Sale & Supply transactions             */
/* -------------------------------------------------------------------------- */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	TransactionFormLinePayload,
	TransactionFormPayload,
} from "components/transaction/Form/TransactionForm";
import { Partner } from "models/partner";
import { PaymentCurrency, PaymentMethod } from "models/payment";
import { Product } from "models/product";
import { Template } from "models/template";
import { DebtPayment, TransactionPaymentRecord } from "models/transaction";
import { useStore } from "stores/StoreContext";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type PaymentRow = {
	id: number;
	amount: number;
	currency: PaymentCurrency;
	exchangeRate: number;
	method: PaymentMethod;
	reference?: string;
};

const DEFAULT_PAYMENT: PaymentRow = {
	id: 1,
	amount: 0,
	currency: "UZS",
	exchangeRate: 1,
	method: "Cash",
};

export interface UseTransactionFormOptions {
	mode: "Sale" | "Supply";
}

export type TransactionFormType = ReturnType<typeof useTransactionForm>;

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

export const useTransactionForm = ({ mode }: UseTransactionFormOptions) => {
	const { partnerStore, templateStore } = useStore();

	/* ─────────── raw state ─────────── */

	const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [notes, setNotes] = useState("");
	const [attachments, setAttachments] = useState<File[]>([]);
	const [lines, setLines] = useState<TransactionFormLinePayload[]>([]);
	const [debtAllocations, setDebtAllocations] = useState<DebtPayment[]>([]);
	const [payments, setPayments] = useState<PaymentRow[]>([DEFAULT_PAYMENT]);

	/* keep MobX stores in sync */
	useEffect(() => {
		partnerStore.setSelectedPartner(selectedPartner?.id);
		templateStore.setSelectedPartner(selectedPartner);
	}, [selectedPartner]);

	const partnerBalance = selectedPartner?.balance ?? 0;

	/* ─────────── product lines helpers ─────────── */

	const addLine = useCallback(
		(product?: Product) => {
			const p = product ?? selectedProduct;
			if (!p) return;
			if (mode === "Sale" && p.quantityInStock <= 0) return;

			setLines((prev) => {
				if (prev.some((l) => l.productId === p.id)) return prev;
				return [
					...prev,
					{
						productId: p.id,
						productName: p.name,
						unitPrice: mode === "Sale" ? p.salePrice : p.supplyPrice,
						quantity: 1,
						discount: 0,
					},
				];
			});
		},
		[mode, selectedProduct],
	);

	const updateLine = useCallback(
		(productId: number, patch: Partial<TransactionFormLinePayload>) =>
			setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, ...patch } : l))),
		[],
	);

	const removeLine = useCallback(
		(productId: number) => setLines((prev) => prev.filter((l) => l.productId !== productId)),
		[],
	);

	/* ─────────── payment helpers ─────────── */

	const totalDue = useMemo(
		() => lines.reduce((s, l) => s + l.unitPrice * l.quantity * (1 - (l.discount ?? 0) / 100), 0),
		[lines],
	);

	const addPayment = useCallback(() => {
		setPayments((prev) => {
			const hasAccount = prev.some((p) => p.method === "AccountBalance");

			/* remaining amount still unpaid in local currency (UZS) */
			const paidSoFar = prev.reduce((s, p) => s + p.amount * p.exchangeRate, 0);
			const remainingDue = Math.max(totalDue - paidSoFar, 0);

			return [
				...prev,
				{
					id: prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
					method: hasAccount ? "Cash" : "AccountBalance",
					amount: hasAccount ? 0 : Math.min(remainingDue, partnerBalance),
					currency: "UZS",
					exchangeRate: 1,
				},
			];
		});
	}, [partnerBalance, totalDue]);

	const updatePayment = useCallback(
		(paymentId: number, patch: Partial<PaymentRow>) =>
			setPayments((prev) =>
				prev.map((p) => {
					if (p.id !== paymentId) return p;
					const next: PaymentRow = { ...p, ...patch };

					if (next.method === "AccountBalance") {
						next.currency = "UZS";
						next.exchangeRate = 1;

						/* autofill on first switch */
						const firstSwitch =
							p.method !== "AccountBalance" ||
							(p.method === "AccountBalance" && p.amount === 0 && next.amount === 0);

						if (firstSwitch) {
							const paidByOthers = prev
								.filter((q) => q.id !== paymentId)
								.reduce((s, q) => s + q.amount * q.exchangeRate, 0);
							const remainingDue = Math.max(totalDue - paidByOthers, 0);
							next.amount = Math.min(remainingDue, partnerBalance);
						}

						next.amount = Math.min(next.amount, partnerBalance); // clamp
					}

					return next;
				}),
			),
		[partnerBalance, totalDue],
	);

	const removePayment = useCallback(
		(id: number) =>
			setPayments((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev)),
		[],
	);

	/* ─────────── attachments helpers ─────────── */

	const addAttachments = (files: FileList) => {
		if (!files.length) return;
		setAttachments((prev) => [...prev, ...Array.from(files)]);
	};

	const removeAttachment = (index: number) =>
		setAttachments((prev) => prev.filter((_, i) => i !== index));

	/* ─────────── derived amounts ─────────── */

	const totalPaidLocal = useMemo(
		() => payments.reduce((s, p) => s + p.amount * p.exchangeRate, 0),
		[payments],
	);

	/** cash‐equivalent withdrawn from partner balance */
	const accountWithdrawal = useMemo(
		() => payments.filter((p) => p.method === "AccountBalance").reduce((s, p) => s + p.amount, 0),
		[payments],
	);
	const hasAccountBalance = accountWithdrawal > 0;

	const diff = totalPaidLocal - totalDue;

	const allocatedTotal = useMemo(
		() => debtAllocations.reduce((s, a) => s + a.amount, 0),
		[debtAllocations],
	);

	/* over-payment is never allowed when AccountBalance is used */
	const advanceAmount = hasAccountBalance ? 0 : Math.max(diff, 0);
	const remainingAdvance = hasAccountBalance ? 0 : Math.max(advanceAmount - allocatedTotal, 0);
	const debtAmount = Math.max(-diff, 0);
	const changeAmount = remainingAdvance;

	/* reset allocations if over-payment disappears */
	useEffect(() => {
		if (advanceAmount <= 0 && debtAllocations.length) setDebtAllocations([]);
	}, [advanceAmount]);

	/* ─────────── validation ─────────── */
	const paymentsAreValid = payments.every((p) => {
		const base =
			p.amount > 0 &&
			Number.isFinite(p.amount) &&
			p.exchangeRate > 0 &&
			(p.currency !== "UZS" || p.exchangeRate === 1);

		return p.method === "AccountBalance" ? base && p.amount <= partnerBalance : base;
	});

	const openDebtExists = partnerBalance < 0;
	const advanceAllowed = !openDebtExists || allocatedTotal > 0;

	const isValid =
		!!selectedPartner &&
		lines.length > 0 &&
		paymentsAreValid &&
		allocatedTotal <= advanceAmount &&
		(hasAccountBalance ? diff <= 0 : true) &&
		advanceAllowed;

	/* ─────────── payload builder ─────────── */

	const buildPayload = (): TransactionFormPayload => {
		const txPayments: TransactionPaymentRecord[] = payments.map(
			({ amount, currency, exchangeRate, method }) => ({
				amount,
				currency,
				exchangeRate,
				method,
			}),
		);

		return {
			partnerId: selectedPartner?.id ?? 0,
			type: mode,
			lines,
			notes,
			payments: txPayments,
			debtPayments: debtAllocations,
		};
	};

	/* ─────────── public contract ─────────── */

	return {
		mode,
		/* raw state */
		selectedPartner,
		selectedTemplate,
		selectedProduct,
		lines,
		payments,
		notes,
		attachments,
		debtAllocations,

		/* derived */
		totalDue,
		totalPaidLocal,
		debtAmount,
		advanceAmount,
		remainingAdvance,
		changeAmount,
		accountWithdrawal, // ← NEW
		hasAccountBalance, // ← NEW
		diff,
		allocatedTotal,
		isValid,

		/* mutators */
		setSelectedPartner,
		setSelectedTemplate,
		setSelectedProduct,
		addLine,
		updateLine,
		removeLine,
		addPayment,
		updatePayment,
		removePayment,
		setNotes,
		addAttachments,
		removeAttachment,
		setDebtAllocations,

		/* actions */
		buildPayload,
	} as const;
};
