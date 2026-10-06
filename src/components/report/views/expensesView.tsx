import React from "react";
import EmployeeLink from "components/employee/Link/EmployeeLink";
import PartnerLink from "components/partner/Links/PartnerLink";
import NoValue from "components/shared/Table/cells/NoValue";
import { TFunction } from "i18next";
import { PaymentType } from "models/payment";
import { ExpensesReport } from "models/report";

import { ReportView } from "../View/types";

/** Who or what the money went to: a partner, an employee's pay, or a «Прочее» description. */
export type ExpenseRecipientKind = "partner" | "employee" | "other";

export interface ExpensesViewRow {
	id: string;
	kind: ExpenseRecipientKind;
	/** Partner / employee id; null for a «Прочее» line. */
	entityId: number | null;
	/** Name or description; null for a «Прочее» payment written without one. */
	name: string | null;
	amount: number;
	count: number;
}

const PARTNER_TYPES: PaymentType[] = ["Transaction", "Deposit", "Withdrawal"];

function recipientCell(row: ExpensesViewRow): React.ReactNode {
	if (row.kind === "partner" && row.entityId !== null) {
		return <PartnerLink id={row.entityId} name={row.name ?? ""} />;
	}
	if (row.kind === "employee" && row.entityId !== null) {
		return <EmployeeLink id={row.entityId} name={row.name ?? ""} />;
	}
	return row.name ? <>{row.name}</> : <NoValue />;
}

/**
 * «Расходы»: money that left the wallets in the period — to partners (suppliers
 * paid, refunds and advances paid out), salaries, and «Прочее» grouped by its
 * description, the only «статья» a payment carries today (reports.md → expenses).
 */
export function buildExpensesView(
	report: ExpensesReport,
	t: TFunction,
): ReportView<ExpensesViewRow> {
	const amountOf = (types: PaymentType[]) =>
		report.byType.filter((b) => types.includes(b.type)).reduce((sum, b) => sum + b.amount, 0);

	const rows: ExpensesViewRow[] = [
		...report.partners.map((p) => ({
			id: `partner-${p.partnerId}`,
			kind: "partner" as const,
			entityId: p.partnerId,
			name: p.name,
			amount: p.amount,
			count: p.count,
		})),
		...report.employees.map((e) => ({
			id: `employee-${e.employeeId}`,
			kind: "employee" as const,
			entityId: e.employeeId,
			name: e.name,
			amount: e.amount,
			count: e.count,
		})),
		...report.other.map((o, index) => ({
			id: `other-${index}`,
			kind: "other" as const,
			entityId: null,
			name: o.description?.trim() || null,
			amount: o.amount,
			count: o.count,
		})),
	].sort((a, b) => b.amount - a.amount);

	return {
		kpis: [
			{
				key: "total",
				caption: t("report.expenses.kpi.total"),
				value: report.total,
				format: "money",
				tone: "expense",
				sub: t("report.expenses.kpi.count", { count: report.count }),
			},
			{
				key: "partners",
				caption: t("report.expenses.kind.partner"),
				hint: t("report.hint.expensePartners"),
				value: amountOf(PARTNER_TYPES),
				format: "money",
			},
			{
				key: "payroll",
				caption: t("report.expenses.kind.employee"),
				value: amountOf(["Payroll"]),
				format: "money",
			},
			{
				key: "other",
				caption: t("report.expenses.kind.other"),
				hint: t("report.hint.expenseOther"),
				value: amountOf(["General"]),
				format: "money",
			},
		],
		chart: {
			title: t("report.expenses.chart"),
			layout: "ranking",
			series: [{ key: "amount", label: t("report.expenses.col.amount"), color: "error" }],
			points: rows.slice(0, 10).map((row) => {
				const name = row.name ?? t("report.expenses.noDescription");
				return { key: row.id, tick: name, heading: name, values: { amount: row.amount } };
			}),
		},
		columns: [
			{
				key: "recipient",
				header: t("report.expenses.col.recipient"),
				kind: "text",
				value: (r) => r.name ?? t("report.expenses.noDescription"),
				cell: recipientCell,
			},
			{
				key: "kind",
				header: t("report.expenses.col.kind"),
				kind: "text",
				value: (r) => t(`report.expenses.kind.${r.kind}`),
			},
			{
				key: "count",
				header: t("report.expenses.col.count"),
				kind: "count",
				value: (r) => r.count,
			},
			{
				key: "amount",
				header: t("report.expenses.col.amount"),
				kind: "money",
				main: true,
				value: (r) => r.amount,
			},
		],
		rows,
		totals: { count: report.count, amount: report.total },
		countLabel: (count) => t("report.count.line", { count }),
		costIsEstimated: false,
		details: [],
		empty: { title: t("report.empty.title"), hint: t("report.expenses.empty") },
	};
}
