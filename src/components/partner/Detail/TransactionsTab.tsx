import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PartnerLedgerEntry, PartnerLedgerStatus } from "models/partner";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatCurrency } from "utils/formatCurrency";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box } from "@mui/material";

import { bodyCellSx, EmptyRecords, headCellSx, SoftChip } from "./detailTable";
import DetailTableCard from "./DetailTableCard";
import FilterDropdown from "./FilterDropdown";
import { DETAIL_ROWS_PER_PAGE_OPTIONS, useDetailTablePage } from "./ledgerHelpers";
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
	partnerName: string;
	initialStatus?: StatusFilter;
	onOpen: (entry: PartnerLedgerEntry) => void;
}

const isRefund = (e: PartnerLedgerEntry) => e.type === "refund-sale" || e.type === "refund-supply";

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
	transactions,
	partnerName,
	initialStatus,
	onOpen,
}) => {
	const { t } = useTranslation();
	const [type, setType] = useState<TypeFilter>("all");
	const [status, setStatus] = useState<StatusFilter>(initialStatus ?? "all");
	const [search, setSearch] = useState("");

	const filtered = useMemo(() => {
		const ql = search.trim().toLowerCase();
		return transactions.filter((tx) => {
			if (type === "sale" && tx.type !== "sale") return false;
			if (type === "supply" && tx.type !== "supply") return false;
			if (type === "refund" && !isRefund(tx)) return false;
			if (status === "open") {
				if (!(tx.status === "unpaid" || tx.status === "partial")) return false;
			} else if (status !== "all" && tx.status !== status) {
				return false;
			}
			if (!ql) {
				return true;
			}
			const haystack = [
				t(eventLabelKey(tx.type)),
				tx.reference ?? "",
				tx.status ? t(`partner.txns.status.${tx.status}`) : "",
				String(Math.abs(tx.delta)),
			]
				.join(" ")
				.toLowerCase();
			return haystack.includes(ql);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transactions, type, status, search, t]);

	const { page, rowsPerPage, setPage, changeRowsPerPage, paginate } = useDetailTablePage(
		`${type}|${status}|${search}`,
	);
	const rows = paginate(filtered);

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

	const handleExport = () => {
		exportToCsv<PartnerLedgerEntry>(
			`partner_${partnerName}_transactions_${csvDateStamp()}`,
			[
				{ header: t("partner.txns.col.date"), value: (tx) => formatDate(tx.date) },
				{ header: t("partner.txns.col.type"), value: (tx) => t(eventLabelKey(tx.type)) },
				{ header: t("partner.txns.col.number"), value: (tx) => tx.reference ?? "" },
				{ header: t("partner.txns.col.positions"), value: (tx) => tx.itemCount ?? "" },
				{ header: t("partner.txns.col.amount"), value: (tx) => Math.abs(tx.delta) },
				{
					header: t("partner.txns.col.status"),
					value: (tx) =>
						isRefund(tx) || !tx.status || tx.status === "done"
							? ""
							: t(`partner.txns.status.${tx.status}`),
				},
			],
			filtered,
		);
	};

	return (
		<DetailTableCard
			search={{ value: search, onChange: setSearch, placeholder: t("partner.txns.search") }}
			filters={
				<>
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
				</>
			}
			onExport={handleExport}
			exportDisabled={filtered.length === 0}
			pagination={{
				count: filtered.length,
				page,
				rowsPerPage,
				rowsPerPageOptions: DETAIL_ROWS_PER_PAGE_OPTIONS,
				onPageChange: setPage,
				onRowsPerPageChange: changeRowsPerPage,
			}}
		>
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
		</DetailTableCard>
	);
};

export default TransactionsTab;
