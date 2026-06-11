import AllocationLink from "components/payment/Links/AllocationLink";
import i18next from "i18n/config";
import { Payment } from "models/payment";

export const isSingleFullAllocation = (p: Payment) =>
	p.allocations.length === 1 &&
	p.allocations[0].transactionId &&
	p.allocations[0].amount === p.amount;

export function formatPaymentType(payment: Payment): React.ReactNode {
	if (isSingleFullAllocation(payment)) {
		return <AllocationLink allocation={payment.allocations[0]} />;
	}

	const map: Record<Payment["type"], string> = {
		Transaction: i18next.t("paymentTypeMixed"),
		Deposit: i18next.t("paymentTypeDeposit"),
		Withdrawal: i18next.t("paymentTypeWithdrawal"),
		Payroll: i18next.t("paymentTypePayroll"),
		General: i18next.t("paymentTypeGeneral"),
	};

	return map[payment.type] ?? payment.type;
}

export const canExpandPayment = (p: Payment) => p.allocations.length > 1;
