import React from "react";
import { useTranslation } from "react-i18next";
import {
	tableBodyCellSx as bodyCellSx,
	tableHeadCellSx as headCellSx,
} from "components/shared/Table/tableStyles";
import { Debt } from "models/debt";
import { DebtPartnerGroup } from "stores/DebtStore";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Paper, Typography } from "@mui/material";

const Chip: React.FC<{ tone: "success" | "warning" | "info"; label: string }> = ({
	tone,
	label,
}) => {
	const tones = {
		success: { bg: designTokens.successBg, color: "#17835A" },
		warning: { bg: designTokens.warningBg, color: "#C57E14" },
		info: { bg: designTokens.infoBg, color: "#2A6F97" },
	}[tone];
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				fontSize: 11.5,
				fontWeight: 600,
				px: "9px",
				py: "2px",
				borderRadius: "999px",
				whiteSpace: "nowrap",
				bgcolor: tones.bg,
				color: tones.color,
			}}
		>
			{label}
		</Box>
	);
};

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
	);
};

const TableShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Paper
		elevation={1}
		sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
	>
		{children}
	</Paper>
);

/* ───────────────────────── by-partner table ───────────────────────── */

interface PartnerDebtTableProps {
	groups: DebtPartnerGroup[];
	anyFilter: boolean;
	onOpen: (group: DebtPartnerGroup) => void;
}

export const PartnerDebtTable: React.FC<PartnerDebtTableProps> = ({
	groups,
	anyFilter,
	onOpen,
}) => {
	const { t } = useTranslation();

	if (groups.length === 0) {
		return (
			<TableShell>
				<EmptyState anyFilter={anyFilter} />
			</TableShell>
		);
	}

	return (
		<TableShell>
			<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<Box component="th" sx={{ ...headCellSx, pl: "18px" }}>
							{t("debt.partnerTable.partner")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("debt.partnerTable.type")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
							{t("debt.partnerTable.count")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("debt.partnerTable.oldest")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
							{t("debt.partnerTable.amount")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, width: 44 }} />
					</tr>
				</thead>
				<tbody>
					{groups.map((g) => {
						const receivable = g.sum > 0;
						return (
							<Box
								component="tr"
								key={g.partnerId}
								onClick={() => onOpen(g)}
								sx={{
									cursor: "pointer",
									"&:hover": { bgcolor: designTokens.gray25, "& .go": { opacity: 1 } },
								}}
							>
								<Box component="td" sx={{ ...bodyCellSx, pl: "18px" }}>
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
								</Box>
								<Box component="td" sx={bodyCellSx}>
									<Chip
										tone={g.direction === "Receivable" ? "info" : "warning"}
										label={t(
											g.direction === "Receivable"
												? "debt.partnerType.customer"
												: "debt.partnerType.supplier",
										)}
									/>
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
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
								</Box>
								<Box component="td" sx={bodyCellSx}>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											gap: "4px",
											alignItems: "flex-start",
										}}
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
											<Box
												component="span"
												sx={{ fontSize: 11, fontWeight: 600, color: "success.main" }}
											>
												{t("debt.inTerm")}
											</Box>
										)}
									</Box>
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
									<Box
										component="span"
										sx={{
											...numericSx,
											fontWeight: 700,
											fontSize: 15,
											color: receivable ? "success.main" : "error.main",
										}}
									>
										{formatCurrency(Math.abs(g.sum))}
									</Box>
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, textAlign: "right", pr: "14px" }}>
									<Box
										className="go"
										sx={{ color: "text.disabled", opacity: 0, transition: "opacity .14s" }}
									>
										<ChevronRightIcon sx={{ fontSize: 18 }} />
									</Box>
								</Box>
							</Box>
						);
					})}
				</tbody>
			</Box>
		</TableShell>
	);
};

/* ───────────────────────── by-transaction table ───────────────────────── */

interface TransactionDebtTableProps {
	rows: Debt[];
	anyFilter: boolean;
	onOpen: (debt: Debt) => void;
}

export const TransactionDebtTable: React.FC<TransactionDebtTableProps> = ({
	rows,
	anyFilter,
	onOpen,
}) => {
	const { t } = useTranslation();

	if (rows.length === 0) {
		return (
			<TableShell>
				<EmptyState anyFilter={anyFilter} />
			</TableShell>
		);
	}

	return (
		<TableShell>
			<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<Box component="th" sx={{ ...headCellSx, pl: "18px" }}>
							{t("debt.txTable.document")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("debt.txTable.type")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("debt.txTable.partner")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
							{t("debt.txTable.total")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
							{t("debt.txTable.paid")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
							{t("debt.txTable.remaining")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
							{t("debt.txTable.age")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, width: 44 }} />
					</tr>
				</thead>
				<tbody>
					{rows.map((d) => {
						const receivable = d.direction === "Receivable";
						const pct = d.total > 0 ? Math.round((d.paid / d.total) * 100) : 0;
						return (
							<Box
								component="tr"
								key={`${d.direction}-${d.transactionId}`}
								onClick={() => onOpen(d)}
								sx={{
									cursor: "pointer",
									"&:hover": { bgcolor: designTokens.gray25, "& .go": { opacity: 1 } },
								}}
							>
								<Box component="td" sx={{ ...bodyCellSx, pl: "18px" }}>
									<Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
										<Box
											sx={{
												width: 30,
												height: 30,
												borderRadius: "8px",
												display: "grid",
												placeItems: "center",
												bgcolor: receivable ? designTokens.successBg : designTokens.warningBg,
												color: receivable ? "#17835A" : "#C57E14",
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
												#{d.number}
											</Box>
											<Box
												component="div"
												sx={{ ...numericSx, fontSize: 12, color: "text.secondary" }}
											>
												{formatDate(d.date)}
											</Box>
										</Box>
									</Box>
								</Box>
								<Box component="td" sx={bodyCellSx}>
									<Chip
										tone={receivable ? "success" : "warning"}
										label={t(receivable ? "debt.txType.sale" : "debt.txType.supply")}
									/>
								</Box>
								<Box component="td" sx={bodyCellSx}>
									<Typography component="div" sx={{ fontWeight: 600, fontSize: 14 }}>
										{d.partnerName}
									</Typography>
									{d.partnerCompany && (
										<Typography component="div" sx={{ fontSize: 12, color: "text.disabled" }}>
											{d.partnerCompany}
										</Typography>
									)}
								</Box>
								<Box
									component="td"
									sx={{ ...bodyCellSx, textAlign: "right", ...numericSx, fontWeight: 600 }}
								>
									{formatCurrency(d.total)}
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
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
										<Box
											component="span"
											sx={{ ...numericSx, fontSize: 13.5, color: "text.secondary" }}
										>
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
												sx={{
													height: "100%",
													width: `${Math.max(pct, 0)}%`,
													bgcolor: "primary.main",
												}}
											/>
										</Box>
									</Box>
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
									<Box
										component="span"
										sx={{
											...numericSx,
											fontWeight: 700,
											fontSize: 15,
											color: receivable ? "success.main" : "error.main",
										}}
									>
										{formatCurrency(d.remaining)}
									</Box>
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											gap: "4px",
											alignItems: "flex-end",
										}}
									>
										<Box
											component="span"
											sx={{ ...numericSx, fontSize: 13.5, color: "text.secondary" }}
										>
											{t("debt.ageDays", { days: d.ageDays })}
										</Box>
										{d.overdueDays > 0 && <OverdueChip days={d.overdueDays} />}
									</Box>
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, textAlign: "right", pr: "14px" }}>
									<Box
										className="go"
										sx={{ color: "text.disabled", opacity: 0, transition: "opacity .14s" }}
									>
										<ChevronRightIcon sx={{ fontSize: 18 }} />
									</Box>
								</Box>
							</Box>
						);
					})}
				</tbody>
			</Box>
		</TableShell>
	);
};
