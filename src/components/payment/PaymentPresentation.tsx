import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import DirectionBadge from "components/shared/DirectionBadge/DirectionBadge";
import { PaymentDirection, PaymentType } from "models/payment";
import { ChipTokenKey } from "theme";

/**
 * Per-type presentation for payments: Оплата teal · Депозит blue · Вывод saffron ·
 * Зарплата purple · Общий neutral. Shared by the list, detail and create modal.
 */
export const PAYMENT_TYPE_META: Record<PaymentType, { labelKey: string; token: ChipTokenKey }> = {
	Transaction: { labelKey: "payment.type.transaction", token: "teal" },
	Deposit: { labelKey: "payment.type.deposit", token: "info" },
	Withdrawal: { labelKey: "payment.type.withdrawal", token: "saffron" },
	Payroll: { labelKey: "payment.type.payroll", token: "purple" },
	General: { labelKey: "payment.type.general", token: "neutral" },
};

export const PaymentTypeBadge: React.FC<{ type: PaymentType }> = ({ type }) => {
	const { t } = useTranslation();
	const meta = PAYMENT_TYPE_META[type];
	return <StatusPill token={meta?.token ?? "neutral"} label={meta ? t(meta.labelKey) : type} />;
};

/** Green ↓ Приход / red ↑ Расход pill — the shared {@link DirectionBadge}. */
export const PaymentDirectionBadge: React.FC<{ direction: PaymentDirection }> = ({ direction }) => {
	const { t } = useTranslation();
	const income = direction === "Income";
	return (
		<DirectionBadge
			income={income}
			label={t(income ? "payment.direction.income" : "payment.direction.expense")}
		/>
	);
};
