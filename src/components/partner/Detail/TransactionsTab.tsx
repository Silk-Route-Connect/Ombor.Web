import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PartnerLedgerEntry, PartnerLedgerStatus } from "models/partner";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box } from "@mui/material";

import { bodyCellSx, EmptyRecords, headCellSx, LedgerCard, SoftChip } from "./detailTable";
import FilterDropdown from "./FilterDropdown";
import { EventCell, eventLabelKey } from "./ledgerMeta";

type TypeFilter = "all" | "sale" | "supply" | "refund";
type StatusFilter = "all" | "open" | "paid" | "partial" | "unpaid";

const STATUS_TONE: Record<"paid" | "partial" | "unpaid", "success" | "warning" | "error"> = {
	paid: "success",
	partial: "warning",
	unpaid: "error",
};

interface TransactionsTabProps {
	transactions: PartnerLedgerEntry[];
	initialStatus?: StatusFilter;
	onOpen: (entry: PartnerLedgerEntry) => void;
}

const isRefund = (e: PartnerLedgerEntry) => e.type === "refund-sale" || e.type === "refund-supply";

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
	transactions,
	initialStatus,
	onOpen,
}) => {
	const { t } = useTranslation();
	const [type, setType] = useState<TypeFilter>("all");
	const [status, setStatus] = useState<StatusFilter>(initialStatus ?? "all");

	const rows = transactions.filter((tx) => {
		if (type === "sale" && tx.type !== "sale") return false;
		if (type === "supply" && tx.type !== "supply") return false;
		if (type === "refund" && !isRefund(tx)) return false;
		if (status === "open") {
			if (!(tx.status === "unpaid" || tx.status === "partial")) return false;
		} else if (status !== "all" && tx.status !== status) {
			return false;
		}
		return true;
	});

	const statusChip = (s?: PartnerLedgerStatus) => {
		if (!s || s === "done") {
			return (
				<Box component="span" sx={{ color: "text.secondary" }}>
					—
				</Box>
			);
		}
		return <SoftChip tone={STATUS_TONE[s]} label={t(`partner.txns.status.${s}`)} />;
	};

	return (
		<>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "14px", flexWrap: "wrap" }}>
				<FilterDropdown<TypeFilter>
					label={t("partner.txns.typeFilter")}
					icon={<FilterListIcon sx={{ fontSize: 15 }} />}
					value={type}
					onChange={setType}
					options={[
						{ value: "all", label: t("partner.txns.type.all") },
						{ value: "sale", label: t("partner.txns.type.sale") },
						{ value: "supply", label: t("partner.txns.type.supply") },
						{ value: "refund", label: t("partner.txns.type.refund") },
					]}
				/>
				<FilterDropdown<StatusFilter>
					label={t("partner.txns.statusFilter")}
					icon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />}
					value={status}
					onChange={setStatus}
					options={[
						{ value: "all", label: t("partner.txns.status.all") },
						{ value: "open", label: t("partner.txns.status.open") },
						{ value: "paid", label: t("partner.txns.status.paid") },
						{ value: "partial", label: t("partner.txns.status.partial") },
						{ value: "unpaid", label: t("partner.txns.status.unpaid") },
					]}
				/>
			</Box>

			<LedgerCard>
				{rows.length === 0 ? (
					<EmptyRecords
						icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />}
						title={t("partner.txns.empty.title")}
						body={t("partner.txns.empty.body")}
					/>
				) : (
					<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr>
								<Box component="th" sx={headCellSx}>
									{t("partner.txns.col.date")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("partner.txns.col.type")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("partner.txns.col.number")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
									{t("partner.txns.col.positions")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
									{t("partner.txns.col.amount")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("partner.txns.col.status")}
								</Box>
							</tr>
						</thead>
						<tbody>
							{rows.map((tx) => (
								<Box
									component="tr"
									key={tx.id}
									onClick={() => onOpen(tx)}
									sx={{ cursor: "pointer", "&:hover": { bgcolor: "grey.50" } }}
								>
									<Box component="td" sx={{ ...bodyCellSx, ...numericSx, whiteSpace: "nowrap" }}>
										{formatDate(tx.date)}
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<EventCell type={tx.type} label={t(eventLabelKey(tx.type))} />
									</Box>
									<Box component="td" sx={{ ...bodyCellSx, ...numericSx, fontWeight: 600 }}>
										{tx.reference ?? "—"}
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											...numericSx,
											color: "text.secondary",
										}}
									>
										{tx.itemCount ?? "—"}
									</Box>
									<Box
										component="td"
										sx={{ ...bodyCellSx, textAlign: "right", ...numericSx, fontWeight: 600 }}
									>
										{formatCurrency(Math.abs(tx.delta))}
									</Box>
									<Box component="td" sx={bodyCellSx}>
										{statusChip(tx.status)}
									</Box>
								</Box>
							))}
						</tbody>
					</Box>
				)}
			</LedgerCard>
		</>
	);
};

export default TransactionsTab;
