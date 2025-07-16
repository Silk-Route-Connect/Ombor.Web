import { useCallback, useEffect, useMemo, useState } from "react";
import {
	TransactionFormLinePayload,
	TransactionFormPayload,
} from "components/transaction/Form/TransactionForm";
import { Partner } from "models/partner";
import { PaymentCurrency, PaymentMethod } from "models/payment";
import { Product } from "models/product";
import { Template } from "models/template";
import { DebtPayment, TransactionPayment } from "models/transaction";
import { useStore } from "stores/StoreContext";

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

export const useTransactionForm = ({ mode }: UseTransactionFormOptions) => {
	const { partnerStore, templateStore } = useStore();

	const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [notes, setNotes] = useState<string>("");
	const [attachments, setAttachments] = useState<File[]>([]);
	const [lines, setLines] = useState<TransactionFormLinePayload[]>([]);
	const [debtAllocations, setDebtAllocations] = useState<DebtPayment[]>([]);
	const [payments, setPayments] = useState<PaymentRow[]>([DEFAULT_PAYMENT]);

	useEffect(() => {
		partnerStore.setSelectedPartner(selectedPartner?.id);
		templateStore.setSelectedPartner(selectedPartner);
	}, [selectedPartner]);

	const addLine = (product?: Product): void => {
		const productToAdd = product ?? selectedProduct;
		if (!productToAdd) {
			return;
		}

		if (mode === "Sale" && productToAdd.quantityInStock <= 0) {
			return;
		}

		setLines((prev) => {
			if (prev.some((line) => line.productId === productToAdd.id)) {
				return prev;
			}

			return [
				...prev,
				{
					productId: productToAdd.id,
					productName: productToAdd.name,
					unitPrice: mode === "Sale" ? productToAdd.salePrice : productToAdd.supplyPrice,
					quantity: 1,
					discount: 0,
				},
			];
		});
	};

	const updateLine = useCallback(
		(productId: number, patch: Partial<TransactionFormLinePayload>) =>
			setLines((prev) =>
				prev.map((line) => (line.productId === productId ? { ...line, ...patch } : line)),
			),
		[],
	);

	const removeLine = useCallback(
		(productId: number) => setLines((prev) => prev.filter((l) => l.productId !== productId)),
		[],
	);

	const addPayment = useCallback(
		() =>
			setPayments((prev) => [
				...prev,
				{
					id: prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
					amount: 0,
					currency: "UZS",
					exchangeRate: 1,
					method: "Cash",
				},
			]),
		[],
	);

	const updatePayment = useCallback(
		(paymentId: number, patch: Partial<PaymentRow>) =>
			setPayments((prev) =>
				prev.map((payment) => (payment.id === paymentId ? { ...payment, ...patch } : payment)),
			),
		[],
	);

	const removePayment = useCallback(
		(paymentId: number) =>
			setPayments((prev) =>
				prev.length > 1 ? prev.filter((payment) => payment.id !== paymentId) : prev,
			),
		[],
	);

	const addAttachments = (files: FileList) => {
		if (files.length === 0) {
			return;
		}

		setAttachments((prev) => [...prev, ...Array.from(files)]);
	};

	const removeAttachment = (index: number) =>
		setAttachments((prev) => prev.filter((_, i) => i !== index));

	const totalDue = useMemo(
		() => lines.reduce((sum, l) => sum + l.unitPrice * l.quantity - (l.discount ?? 0), 0),
		[lines],
	);

	const totalPaidLocal = useMemo(
		() => payments.reduce((sum, p) => sum + p.amount * p.exchangeRate, 0),
		[payments],
	);

	const diff = totalPaidLocal - totalDue;

	const allocatedTotal = useMemo(
		() => debtAllocations.reduce((s, a) => s + a.amount, 0),
		[debtAllocations],
	);

	const advanceAmount = Math.max(diff, 0);
	const remainingAdvance = Math.max(advanceAmount - allocatedTotal, 0);
	const debtAmount = Math.max(-diff, 0);
	const changeAmount = remainingAdvance;

	useEffect(() => {
		if (advanceAmount <= 0 && debtAllocations.length) {
			setDebtAllocations([]);
		}
	}, [advanceAmount]);

	const isValid =
		!!selectedPartner &&
		lines.length > 0 &&
		payments.every(
			(p) =>
				p.amount > 0 &&
				Number.isFinite(p.amount) &&
				p.exchangeRate > 0 &&
				(p.currency !== "UZS" || p.exchangeRate === 1),
		) &&
		allocatedTotal <= advanceAmount;

	const buildPayload = (): TransactionFormPayload => {
		const transactionPayments: TransactionPayment[] = payments.map((payment) => ({
			amount: payment.amount,
			method: payment.method,
			currency: payment.currency,
			exchangeRate: payment.exchangeRate,
		}));

		return {
			partnerId: selectedPartner?.id ?? 0,
			type: mode,
			lines,
			notes,
			payments: transactionPayments,
			debtPayments: debtAllocations.length ? debtAllocations : [],
		};
	};

	return {
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
		changeAmount,
		debtAmount,
		advanceAmount,
		remainingAdvance,
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
