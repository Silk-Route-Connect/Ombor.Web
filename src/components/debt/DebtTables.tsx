import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import PartnerTypeChip from "components/partner/PartnerTypeChip";
import { Column, DataTable, DefaultSort } from "components/shared/Table/DataTable/DataTable";
import { TransactionTypeBadge } from "components/transaction/TransactionBadges";
import { Debt } from "models/debt";
import { DebtPartnerGroup } from "stores/DebtStore";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import { directionOf, isRefundType } from "utils/transactionUtils";

import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Paper, Typography } from "@mui/material";

/** Keep an inner entity link from also triggering the row's open click. */
const stop = (e: React.MouseEvent) => e.stopPropagation();

const OverdueChip: React.FC<{ days: number }> = ({ days }) => {
	const { t } = useTranslation();
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "4px",
				fontSize: 11,
				fontWeight: 600,
				px: "7px",
				py: "1px",
				borderRadius: "999px",
				bgcolor: designTokens.errorBg,
				color: "error.main",
				whiteSpace: "nowrap",
			}}
		>
			<ReportProblemOutlinedIcon sx={{ fontSize: 11 }} />
			{t("debt.overdueChip", { days })}
		</Box>
	);
};

const Avatar: React.FC<{ name: string }> = ({ name }) => (
	<Box
		sx={{
			width: 36,
			height: 36,
			flex: "0 0 auto",
			borderRadius: "50%",
			display: "grid",
			placeItems: "center",
			bgcolor: "primary.light",
			color: "primary.main",
			fontSize: 14,
			fontWeight: 700,
		}}
	>
		{name.trim().charAt(0).toUpperCase()}
	</Box>
);

const EmptyState: React.FC<{ anyFilter: boolean }> = ({ anyFilter }) => {
	const { t } = useTranslation();
	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
		>
			<Box sx={{ p: "56px 24px 60px", textAlign: "center" }}>
				<Box
					sx={{
						width: 58,
						height: 58,
						borderRadius: 2,
						mx: "auto",
						mb: 2,
						display: "grid",
						placeItems: "center",
						bgcolor: "grey.50",
						border: 1,
						borderColor: "divider",
						color: "text.disabled",
					}}
				>
					<ReplayOutlinedIcon sx={{ fontSize: 26 }} />
				</Box>
				<Typography variant="h2" sx={{ mb: 0.75 }}>
					{anyFilter ? t("debt.empty.filteredTitle") : t("debt.empty.title")}
				</Typography>
				<Typography
					variant="body2"
					sx={{ color: "text.secondary", maxWidth: 400, mx: "auto", lineHeight: 1.6 }}
				>
					{anyFilter ? t("debt.empty.filteredBody") : t("debt.empty.body")}
				</Typography>
			</Box>
		</Paper>
	);
};

/* ───────────────────────── by-partner table ───────────────────────── */

interface PartnerDebtTableProps {
	groups: DebtPartnerGroup[];
	anyFilter: boolean;
	onOpen: (group: DebtPartnerGroup) => void;
}

/**
 * By-partner aggregates on the shared DataTable (warm band, sortable columns,
 * 10/25/50 pager). The «Сумма» column sorts by absolute debt — largest exposure
 * first regardless of direction (the tab's established order); colour carries
 * the sign (no +/− signs, locked pattern 4).
 */
export const PartnerDebtTable: React.FC<PartnerDebtTableProps> = ({
	groups,
	anyFilter,
	onOpen,
}) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<DebtPartnerGroup>[]>(
		() => [
			{
				key: "partner",
				headerName: t("debt.partnerTable.partner"),
				sortValue: (g) => g.partnerName,
				renderCell: (g) => (
					<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
						<Avatar name={g.partnerName} />
						<Box sx={{ minWidth: 0 }}>
							<Typography component="div" sx={{ fontWeight: 600, fontSize: 14.5 }}>
								{g.partnerName}
							</Typography>
							{g.partnerCompany && (
								<Typography component="div" sx={{ fontSize: 12, color: "text.disabled" }}>
									{g.partnerCompany}
								</Typography>
							)}
						</Box>
					</Box>
				),
			},
			{
				key: "type",
				headerName: t("debt.partnerTable.type"),
				// The chip reflects the debt-direction role: they owe us → «Клиент»,
				// we owe them → «Поставщик».
				sortValue: (g) =>
					t(`partner.typeShort.${g.direction === "Receivable" ? "Customer" : "Supplier"}`),
				renderCell: (g) => (
					<PartnerTypeChip type={g.direction === "Receivable" ? "Customer" : "Supplier"} />
				),
			},
			{
				key: "count",
				headerName: t("debt.partnerTable.count"),
				align: "right",
				sortValue: (g) => g.count,
				renderCell: (g) => (
					<Box
						component="span"
						sx={{
							...numericSx,
							fontWeight: 700,
							fontSize: 12.5,
							color: designTokens.gray600,
							bgcolor: "grey.100",
							px: "9px",
							py: "2px",
							borderRadius: "999px",
						}}
					>
						{g.count}
					</Box>
				),
			},
			{
				key: "oldest",
				headerName: t("debt.partnerTable.oldest"),
				sortValue: (g) => g.oldestDate,
				renderCell: (g) => (
					<Box
						sx={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}
					>
						<Box component="span" sx={{ ...numericSx, fontSize: 13.5 }}>
							{formatDate(g.oldestDate)}
						</Box>
						{g.overdueCount > 0 ? (
							<Box
								component="span"
								sx={{
									display: "inline-flex",
									alignItems: "center",
									gap: "4px",
									fontSize: 11,
									fontWeight: 600,
									px: "7px",
									py: "1px",
									borderRadius: "999px",
									bgcolor: designTokens.errorBg,
									color: "error.main",
								}}
							>
								<ReportProblemOutlinedIcon sx={{ fontSize: 11 }} />
								{t("debt.partnerTable.overdueCount", { count: g.overdueCount })}
							</Box>
						) : (
							<Box component="span" sx={{ fontSize: 11, fontWeight: 600, color: "success.main" }}>
								{t("debt.inTerm")}
							</Box>
						)}
					</Box>
				),
			},
			{
				key: "amount",
				headerName: t("debt.partnerTable.amount"),
				align: "right",
				// Absolute value — «largest debt first» regardless of direction.
				sortValue: (g) => Math.abs(g.sum),
				renderCell: (g) => (
					<Box
						component="span"
						sx={{
							...numericSx,
							fontWeight: 700,
							fontSize: 15,
							color: g.sum > 0 ? "success.main" : "error.main",
						}}
					>
						{formatCurrency(Math.abs(g.sum))}
					</Box>
				),
			},
		],
		[t],
	);

	if (groups.length === 0) {
		return <EmptyState anyFilter={anyFilter} />;
	}

	return (
		<DataTable<DebtPartnerGroup>
			rows={groups}
			columns={columns}
			pagination
			defaultSort={{ key: "amount", order: "desc" }}
			onRowClick={onOpen}
		/>
	);
};

/* ───────────────────────── by-transaction table ───────────────────────── */

type DebtRow = Debt & { id: number };

interface TransactionDebtTableProps {
	rows: Debt[];
	anyFilter: boolean;
	/** Initial sort — seeded by the summary-card presets («Просрочено» → age). */
	defaultSort: DefaultSort;
	onOpen: (debt: Debt) => void;
}

/**
 * Flat outstanding-transaction rows on the shared DataTable. Column headers own
 * ad-hoc sorting (the old sort dropdown is gone); the dashboard/summary-card
 * presets arrive as `defaultSort`. Row click opens the transaction detail; the
 * partner cell deep-links to the partner instead.
 */
export const TransactionDebtTable: React.FC<TransactionDebtTableProps> = ({
	rows,
	anyFilter,
	defaultSort,
	onOpen,
}) => {
	const { t } = useTranslation();

	const dataRows = useMemo<DebtRow[]>(
		() => rows.map((d) => ({ ...d, id: d.transactionId })),
		[rows],
	);

	const columns = useMemo<Column<DebtRow>[]>(
		() => [
			{
				key: "document",
				headerName: t("debt.txTable.document"),
				// Served document number, numeric id fallback (avoids lexicographic ids).
				sortValue: (d) => d.number ?? d.transactionId,
				renderCell: (d) => {
					const receivable = d.direction === "Receivable";
					return (
						<Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
							<Box
								sx={{
									width: 30,
									height: 30,
									borderRadius: "8px",
									display: "grid",
									placeItems: "center",
									flex: "0 0 auto",
									bgcolor: receivable ? designTokens.successBg : designTokens.warningBg,
									color: receivable ? "success.main" : "warning.main",
								}}
							>
								{receivable ? (
									<NorthEastIcon sx={{ fontSize: 15 }} />
								) : (
									<LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />
								)}
							</Box>
							<Box>
								<Box component="div" sx={{ ...numericSx, fontWeight: 600, fontSize: 14 }}>
									{formatEntityId(d.number ?? d.transactionId)}
								</Box>
								<Box component="div" sx={{ ...numericSx, fontSize: 12, color: "text.secondary" }}>
									{formatDate(d.date)}
								</Box>
							</Box>
						</Box>
					);
				},
			},
			{
				key: "type",
				headerName: t("debt.txTable.type"),
				// Key off the actual type (incl. refunds) so the sort order matches the
				// badge label — direction alone would file «Возврат поставки» under Sale.
				sortValue: (d) =>
					t(
						isRefundType(d.transactionType)
							? `transaction.badge.refund.${directionOf(d.transactionType)}`
							: `transaction.badge.base.${directionOf(d.transactionType)}`,
					),
				renderCell: (d) => <TransactionTypeBadge type={d.transactionType} />,
			},
			{
				key: "partner",
				headerName: t("debt.txTable.partner"),
				sortValue: (d) => d.partnerName,
				renderCell: (d) => (
					<Box sx={{ minWidth: 0 }}>
						<Typography component="div" sx={{ fontWeight: 600, fontSize: 14 }}>
							<Box component="span" onClick={stop}>
								<PartnerLink id={d.partnerId} name={d.partnerName} />
							</Box>
						</Typography>
						{d.partnerCompany && (
							<Typography component="div" sx={{ fontSize: 12, color: "text.disabled" }}>
								{d.partnerCompany}
							</Typography>
						)}
					</Box>
				),
			},
			{
				key: "total",
				headerName: t("debt.txTable.total"),
				align: "right",
				sortValue: (d) => d.total,
				renderCell: (d) => (
					<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
						{formatCurrency(d.total)}
					</Box>
				),
			},
			{
				key: "paid",
				headerName: t("debt.txTable.paid"),
				align: "right",
				sortValue: (d) => d.paid,
				renderCell: (d) => {
					const pct = d.total > 0 ? Math.round((d.paid / d.total) * 100) : 0;
					return (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: "5px",
								alignItems: "flex-end",
								minWidth: 116,
								ml: "auto",
							}}
						>
							<Box component="span" sx={{ ...numericSx, fontSize: 13.5, color: "text.secondary" }}>
								{formatCurrency(d.paid)}
							</Box>
							<Box
								sx={{
									width: "100%",
									height: 5,
									borderRadius: "999px",
									bgcolor: designTokens.gray300,
									overflow: "hidden",
								}}
							>
								<Box
									sx={{ height: "100%", width: `${Math.max(pct, 0)}%`, bgcolor: "primary.main" }}
								/>
							</Box>
						</Box>
					);
				},
			},
			{
				key: "remaining",
				headerName: t("debt.txTable.remaining"),
				align: "right",
				sortValue: (d) => d.remaining,
				renderCell: (d) => (
					<Box
						component="span"
						sx={{
							...numericSx,
							fontWeight: 700,
							fontSize: 15,
							color: d.direction === "Receivable" ? "success.main" : "error.main",
						}}
					>
						{formatCurrency(d.remaining)}
					</Box>
				),
			},
			{
				key: "age",
				headerName: t("debt.txTable.age"),
				align: "right",
				sortValue: (d) => d.ageDays,
				renderCell: (d) => (
					<Box
						sx={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}
					>
						<Box component="span" sx={{ ...numericSx, fontSize: 13.5, color: "text.secondary" }}>
							{t("debt.ageDays", { days: d.ageDays })}
						</Box>
						{d.overdueDays > 0 && <OverdueChip days={d.overdueDays} />}
					</Box>
				),
			},
		],
		[t],
	);

	if (rows.length === 0) {
		return <EmptyState anyFilter={anyFilter} />;
	}

	return (
		<DataTable<DebtRow>
			rows={dataRows}
			columns={columns}
			pagination
			defaultSort={defaultSort}
			onRowClick={onOpen}
		/>
	);
};
