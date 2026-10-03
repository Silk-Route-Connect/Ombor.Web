import React from "react";
import EmployeeLink from "components/employee/Link/EmployeeLink";
import PartnerLink from "components/partner/Links/PartnerLink";
import {
	PAYMENT_TYPE_META,
	PaymentDirectionBadge,
	PaymentTypeBadge,
} from "components/payment/PaymentPresentation";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import NoValue from "components/shared/Table/cells/NoValue";
import { Column } from "components/shared/Table/DataTable/DataTable";
import WalletLink from "components/wallet/Links/WalletLink";
import { TFunction } from "i18next";
import { PaymentRecord } from "models/payment";
import { paymentDetailPath } from "routing/paths";
import { entityNumberSortValue } from "utils/formatEntityId";
import { paymentMoneyTone } from "utils/paymentUtils";

/** The party a payment is with — a partner, or an employee for payroll. */
const PartyCell: React.FC<{ payment: PaymentRecord }> = ({ payment: p }) => {
	if (p.partnerId != null && p.partnerName) {
		return <PartnerLink id={p.partnerId} name={p.partnerName} />;
	}
	if (p.employeeId != null && p.employeeName) {
		return <EmployeeLink id={p.employeeId} name={p.employeeName} />;
	}
	return <NoValue />;
};

/**
 * Payments list columns in the canonical order (conventions.md → Tables):
 * № · Дата · Партнёр · Тип · Направление · Касса · Сумма. Payments are
 * immutable — no actions column; the amount is unsigned, coloured by direction.
 */
export function buildPaymentColumns(t: TFunction): Column<PaymentRecord>[] {
	return [
		{
			key: "number",
			headerName: t("payment.table.number"),
			sortValue: (p) => entityNumberSortValue(p.number),
			renderCell: (p) => <DocNumberCell number={p.number} to={paymentDetailPath(p.id)} />,
		},
		{
			key: "date",
			headerName: t("payment.table.date"),
			sortValue: (p) => new Date(p.date),
			renderCell: (p) => <DateCell value={p.date} />,
		},
		{
			key: "party",
			headerName: t("payment.table.party"),
			sortValue: (p) => p.partnerName ?? p.employeeName ?? "",
			renderCell: (p) => <PartyCell payment={p} />,
		},
		{
			key: "type",
			headerName: t("payment.table.type"),
			sortValue: (p) => t(PAYMENT_TYPE_META[p.type].labelKey),
			renderCell: (p) => <PaymentTypeBadge type={p.type} />,
		},
		{
			key: "direction",
			headerName: t("payment.table.direction"),
			sortValue: (p) => t(`payment.direction.${p.direction}`),
			renderCell: (p) => <PaymentDirectionBadge direction={p.direction} />,
		},
		{
			key: "wallet",
			headerName: t("payment.table.wallet"),
			sortValue: (p) => p.walletName,
			renderCell: (p) => <WalletLink id={p.walletId} name={p.walletName} />,
		},
		{
			key: "amount",
			headerName: t("payment.table.amount"),
			align: "right",
			sortValue: (p) => p.amount,
			renderCell: (p) => <MoneyCell value={p.amount} main tone={paymentMoneyTone(p.direction)} />,
		},
	];
}
