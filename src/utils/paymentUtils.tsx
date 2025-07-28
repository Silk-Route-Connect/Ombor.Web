import AllocationLink from "components/shared/Links/AllocationLink";
import { translate } from "i18n/i18n";
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
		Transaction: translate("paymentTypeMixed"),
		Deposit: translate("paymentTypeDeposit"),
		Withdrawal: translate("paymentTypeWithdrawal"),
		Payroll: translate("paymentTypePayroll"),
		General: translate("paymentTypeGeneral"),
	};

	return map[payment.type] ?? payment.type;
}

export const canExpandPayment = (p: Payment) => p.allocations.length > 1;
