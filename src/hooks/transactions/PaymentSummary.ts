import { useMemo } from "react";
import { PartnerBalance } from "models/partner";
import { DebtPayment } from "models/transaction";

import { PaymentRow } from "./PaymentsState";

export interface PaymentSummary {
	totalPaid: number;
	overpaid: number;
	underpaid: number;
	debtPaid: number;
	effectiveOverpaid: number;
	balanceAfter: number;

	mustUseAccountBalance: boolean;
	mustAllocateDebt: boolean;
	paymentIsValid: boolean;
}

interface Params {
	mode: "Sale" | "Supply";
	totalDue: number;
	payments: PaymentRow[];
	debtPayments: DebtPayment[];
	refundChange: boolean;
	partnerBalance: PartnerBalance;
}

export function usePaymentSummary({
	mode,
	totalDue,
	payments,
	debtPayments,
	refundChange,
	partnerBalance,
}: Params): PaymentSummary {
	const totalPaid = useMemo(
		() => payments.reduce((s, p) => s + p.amount * p.exchangeRate, 0),
		[payments],
	);
	const debtPaid = useMemo(() => debtPayments.reduce((s, d) => s + d.amount, 0), [debtPayments]);

	const overpaid = Math.max(totalPaid - totalDue, 0);
	const underpaid = Math.max(totalDue - totalPaid, 0);
	const effectiveOverpaid = Math.max(overpaid - debtPaid, 0);

	const accRow = payments.find((p) => p.method === "AccountBalance");
	const hasAccBalanceRow = !!accRow && accRow.amount > 0;
	const accBalanceUsedLCY = accRow ? accRow.amount * accRow.exchangeRate : 0;

	const balanceAfter = useMemo(() => {
		const paidForCurrent = totalPaid - debtPaid;
		const unpaid = Math.max(totalDue - paidForCurrent, 0);
		const extraAdvance = refundChange ? 0 : Math.max(paidForCurrent - totalDue, 0);

		if (mode === "Sale") {
			return (
				partnerBalance.total +
				debtPaid - // partner debt decreases
				unpaid + // new debt increases negative balance
				extraAdvance - // company owes partner more
				accBalanceUsedLCY // credit consumed
			);
		}

		return (
			partnerBalance.total -
			debtPaid + // paying supplier debt reduces what company owes
			unpaid - // unpaid increases company liability
			extraAdvance + // advance kept by supplier reduces liability
			accBalanceUsedLCY // supplier used negative balance → company owes more
		);
	}, [mode, partnerBalance, totalPaid, debtPaid, totalDue, refundChange, accBalanceUsedLCY]);

	const mustUseAccountBalance =
		(mode === "Sale" ? partnerBalance.partnerAdvance > 0 : partnerBalance.companyAdvance > 0) &&
		totalPaid < totalDue &&
		!hasAccBalanceRow;

	const mustAllocateDebt =
		(mode === "Sale" ? partnerBalance.payableDebt > 0 : partnerBalance.receivableDebt > 0) &&
		overpaid > 0 &&
		debtPaid === 0;

	const paymentsAreValid = payments.every((row) => {
		const positive = row.amount > 0 && Number.isFinite(row.amount) && row.exchangeRate > 0;
		const currencyRule = row.currency === "UZS" ? row.exchangeRate === 1 : row.exchangeRate !== 1;
		const advance = mode === "Sale" ? partnerBalance.partnerAdvance : partnerBalance.companyAdvance;

		const accountRule =
			row.method === "AccountBalance"
				? row.amount <= Math.abs(advance) && row.currency === "UZS"
				: true;

		return positive && currencyRule && accountRule;
	});

	const paymentIsValid = paymentsAreValid && !mustUseAccountBalance && !mustAllocateDebt;

	return {
		totalPaid,
		overpaid,
		underpaid,
		debtPaid,
		effectiveOverpaid,
		balanceAfter,

		mustUseAccountBalance,
		mustAllocateDebt,
		paymentIsValid,
	};
}
