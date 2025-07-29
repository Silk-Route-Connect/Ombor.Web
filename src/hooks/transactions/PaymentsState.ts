import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Partner, PartnerBalance } from "models/partner";
import { PaymentCurrency, PaymentMethod } from "models/payment";
import { DebtPayment, TransactionPaymentRecord } from "models/transaction";

import { usePaymentSummary } from "./PaymentSummary";

export type PaymentRow = {
	id: number;
	amount: number;
	exchangeRate: number;
	currency: PaymentCurrency;
	method: Exclude<PaymentMethod, "BalanceWithdrawal">;
	reference?: string;
};

const createDefaultPayment = (id: number): PaymentRow => ({
	id,
	amount: 0,
	currency: "UZS",
	exchangeRate: 1,
	method: "Cash",
});

const toPaymentRecord = ({
	amount,
	currency,
	exchangeRate,
	method,
}: PaymentRow): TransactionPaymentRecord => ({
	amount,
	currency,
	exchangeRate,
	method,
});

const balanceOrDefault = (partner?: Partner | null): PartnerBalance =>
	partner?.balanceDto
		? partner.balanceDto
		: { total: 0, companyAdvance: 0, partnerAdvance: 0, payableDebt: 0, receivableDebt: 0 };

export interface PaymentsState {
	availablePaymentMethods: Exclude<PaymentMethod, "BalanceWithdrawal">[];

	payments: PaymentRow[];
	addPayment(): void;
	updatePayment(id: number, patch: Partial<PaymentRow>): void;
	removePayment(id: number): void;

	debtPayments: DebtPayment[];
	setDebtPayments(debtPayment: DebtPayment[]): void;

	refundChange: boolean;
	setRefundChange(flag: boolean): void;

	notes: string;
	setNotes(notes: string): void;

	attachments: File[];
	addAttachments(files: FileList): void;
	removeAttachment(index: number): void;

	totalPaid: number;
	overpaid: number;
	underpaid: number;
	debtPaid: number;
	effectiveOverpaid: number;
	balanceAfter: number;

	hasAccountBalanceRow: boolean;
	openDebtExists: boolean;
	mustUseAccountBalance: boolean;
	paymentIsValid: boolean;
	mustAllocateDebt: boolean;

	buildPaymentPayload(): TransactionPaymentRecord[];
}

export function useTransactionPayments(
	mode: "Sale" | "Supply",
	partner: Partner | null,
	totalDue: number,
): PaymentsState {
	const [payments, setPayments] = useState<PaymentRow[]>([createDefaultPayment(1)]);
	const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
	const [refundChange, setRefundChange] = useState(true);
	const [notes, setNotes] = useState("");
	const [files, setFiles] = useState<File[]>([]);

	const nextPaymentId = useRef(2);
	const partnerBalance = balanceOrDefault(partner);
	const advanceBalance =
		mode === "Sale" ? partnerBalance.partnerAdvance : partnerBalance.companyAdvance;
	const debtBalance = mode === "Sale" ? partnerBalance.payableDebt : partnerBalance.receivableDebt;

	const summary = usePaymentSummary({
		mode,
		totalDue,
		payments,
		debtPayments,
		refundChange,
		partnerBalance,
	});

	const {
		totalPaid,
		overpaid,
		underpaid,
		debtPaid,
		effectiveOverpaid,
		balanceAfter,
		mustUseAccountBalance,
		mustAllocateDebt,
		paymentIsValid,
	} = summary;

	const canUseAccountBalance = advanceBalance > 0;

	const availablePaymentMethods: PaymentMethod[] = useMemo(() => {
		const base: Exclude<PaymentMethod, "AccountBalance">[] = ["Cash", "Card", "BankTransfer"];

		return !payments.some((p) => p.method === "AccountBalance") && canUseAccountBalance
			? [...base, "AccountBalance"]
			: base;
	}, [payments, canUseAccountBalance]);

	const addPayment = useCallback(() => {
		setPayments((prev) => {
			const hasAccBal = prev.some((p) => p.method === "AccountBalance");
			const paidSoFar = prev.reduce((s, r) => s + r.amount * r.exchangeRate, 0);
			const remaining = Math.max(totalDue - paidSoFar, 0);

			const shouldAutoAcc = mode === "Sale" && advanceBalance > 0 && remaining > 0 && !hasAccBal;

			const method: PaymentRow["method"] = shouldAutoAcc ? "AccountBalance" : "Cash";
			const amount =
				method === "AccountBalance" ? Math.min(remaining, Math.abs(advanceBalance)) : 0;

			return [
				...prev,
				{
					id: nextPaymentId.current++,
					method,
					amount,
					currency: "UZS",
					exchangeRate: 1,
				},
			];
		});
	}, [mode, partnerBalance, totalDue]);

	const updatePayment = useCallback(
		(id: number, patch: Partial<PaymentRow>) =>
			setPayments((prev) =>
				prev.map((row) => {
					if (row.id !== id) {
						return row;
					}
					const updated = { ...row, ...patch };

					if (updated.method === "AccountBalance") {
						updated.currency = "UZS";
						updated.exchangeRate = 1;

						const others = prev
							.filter((p) => p.id !== id)
							.reduce((s, p) => s + p.amount * p.exchangeRate, 0);
						const remaining = Math.max(totalDue - others, 0);
						updated.amount = Math.min(remaining, Math.abs(advanceBalance));
					}
					return updated;
				}),
			),
		[partnerBalance, totalDue],
	);

	const removePayment = useCallback(
		(id: number) =>
			setPayments((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev)),
		[],
	);

	const addAttachments = (files: FileList) => setFiles((prev) => [...prev, ...Array.from(files)]);

	const removeAttachment = (index: number) =>
		setFiles((prev) => prev.filter((_, i) => i !== index));

	useEffect(() => {
		if (overpaid === 0 && debtPayments.length) {
			setDebtPayments([]);
		}
	}, [overpaid, debtPayments.length]);

	useEffect(() => setDebtPayments([]), [partner]);

	const buildPaymentPayload = (): TransactionPaymentRecord[] => payments.map(toPaymentRecord);

	const hasAccountBalanceRow = payments.some((p) => p.method === "AccountBalance" && p.amount > 0);
	const openDebtExists = debtBalance > 0;

	return {
		availablePaymentMethods,

		payments,
		addPayment,
		updatePayment,
		removePayment,

		debtPayments,
		setDebtPayments,

		refundChange,
		setRefundChange,

		notes,
		setNotes,

		attachments: files,
		addAttachments,
		removeAttachment,

		totalPaid,
		overpaid,
		underpaid,
		debtPaid,
		effectiveOverpaid,
		balanceAfter,

		hasAccountBalanceRow,
		openDebtExists,
		mustUseAccountBalance,
		paymentIsValid,
		mustAllocateDebt,

		buildPaymentPayload,
	};
}
