import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { eventLabelKey } from "components/partner/Detail/ledgerMeta";
import PrintDocHeader from "components/shared/Print/PrintDocHeader";
import PrintParties from "components/shared/Print/PrintParties";
import PrintSignatures from "components/shared/Print/PrintSignatures";
import PrintTable, { PrintColumn, PrintSummaryRow } from "components/shared/Print/PrintTable";
import { parseISO } from "date-fns";
import { TFunction } from "i18next";
import { Partner } from "models/partner";
import { Organization } from "models/settings";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatOptionalNumber } from "utils/formatEntityId";
import { PartnerStatement, StatementRow } from "utils/partnerStatement";
import { formatUzPhone } from "utils/phoneUtils";

import { Typography } from "@mui/material";

interface PartnerStatementSheetProps {
	organization: Organization;
	partner: Partner;
	statement: PartnerStatement;
}

/** A balance with whose favour it is: «500 000 Д» (they owe us), «30 000 К» (we owe them). */
const saldo = (t: TFunction, value: number): string => {
	if (value === 0) {
		return "0";
	}
	const side = value > 0 ? "print.statement.debitShort" : "print.statement.creditShort";
	return `${formatCurrency(Math.abs(value))} ${t(side)}`;
};

/** A balance placed in the Дебет or Кредит column, the other one left blank. */
const sideCells = (value: number) => ({
	debit: value >= 0 ? formatCurrency(value) : "",
	credit: value < 0 ? formatCurrency(-value) : "",
});

const day = (iso: string) => formatDate(parseISO(iso));

/**
 * The printed «Акт сверки взаиморасчётов» from the business's books: opening
 * balance, every ledger entry of the period with Дебет / Кредит and the running
 * balance, the period turnover, the closing balance in plain words, and both
 * parties' signatures. Figures are the served ledger's (hard rule 8).
 */
export const PartnerStatementSheet: React.FC<PartnerStatementSheetProps> = ({
	organization,
	partner,
	statement,
}) => {
	const { t } = useTranslation();
	const names = { org: organization.name, partner: partner.name };
	const { from, to } = statement.period;

	const columns = useMemo<PrintColumn<StatementRow>[]>(
		() => [
			{
				key: "date",
				header: t("print.col.date"),
				width: "12%",
				render: (r) => formatDate(r.entry.date),
			},
			{
				key: "number",
				header: t("print.col.document"),
				width: "10%",
				render: (r) => formatOptionalNumber(r.entry.reference, "—"),
			},
			{
				key: "operation",
				header: t("print.col.operation"),
				render: (r) => t(eventLabelKey(r.entry.type)),
			},
			{
				key: "debit",
				header: t("print.col.debit"),
				align: "right",
				render: (r) => (r.debit ? formatCurrency(r.debit) : ""),
			},
			{
				key: "credit",
				header: t("print.col.credit"),
				align: "right",
				render: (r) => (r.credit ? formatCurrency(r.credit) : ""),
			},
			{
				key: "balance",
				header: t("print.col.saldo"),
				align: "right",
				render: (r) => saldo(t, r.balance),
			},
		],
		[t],
	);

	const leadRows: PrintSummaryRow[] = [
		{
			key: "opening",
			label: t("print.statement.openingRow", { date: day(from) }),
			cells: { ...sideCells(statement.opening), balance: saldo(t, statement.opening) },
		},
	];
	const summaryRows: PrintSummaryRow[] = [
		{
			key: "turnover",
			label: t("print.statement.turnoverRow"),
			cells: {
				debit: formatCurrency(statement.debitTotal),
				credit: formatCurrency(statement.creditTotal),
			},
		},
		{
			key: "closing",
			label: t("print.statement.closingRow", { date: day(to) }),
			cells: { ...sideCells(statement.closing), balance: saldo(t, statement.closing) },
			strong: true,
		},
	];

	const resultKey =
		statement.closing > 0
			? "print.statement.resultOwesUs"
			: statement.closing < 0
				? "print.statement.resultWeOwe"
				: "print.statement.resultSettled";

	return (
		<>
			<PrintDocHeader
				organization={organization}
				title={t("print.statement.title")}
				subtitle={[
					t("print.statement.period", { from: day(from), to: day(to) }),
					t("print.statement.between", names),
				]}
			/>
			<PrintParties
				parties={[
					{
						role: t("print.statement.ourSide"),
						name: organization.name,
						details: [organization.address, organization.phone],
					},
					{
						role: t("print.statement.partnerSide"),
						name: partner.name,
						details: [
							partner.companyName,
							partner.phoneNumbers.map(formatUzPhone).join(", "),
							partner.address,
						],
					},
				]}
			/>
			<Typography sx={{ fontSize: 12, color: "text.secondary", mb: "8px" }}>
				{t("print.statement.legend", names)}
			</Typography>
			<PrintTable<StatementRow>
				columns={columns}
				rows={statement.rows}
				rowKey={(r, i) => `${r.entry.type}-${r.entry.id}-${i}`}
				leadRows={leadRows}
				summaryRows={summaryRows}
				emptyText={t("print.statement.noRows")}
			/>
			<Typography sx={{ fontSize: 14, fontWeight: 700, mb: "4px" }}>
				{t(resultKey, {
					...names,
					date: day(to),
					amount: `${formatCurrency(Math.abs(statement.closing))} ${t("common.unit.uzs")}`,
				})}
			</Typography>
			<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
				{t("print.statement.basis", names)}
			</Typography>
			<PrintSignatures
				blocks={[
					{ title: t("print.statement.ourSignature"), name: organization.name },
					{ title: t("print.statement.partnerSignature"), name: partner.name },
				]}
			/>
		</>
	);
};

export default PartnerStatementSheet;
