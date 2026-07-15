import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DetailSortHeader, { SortDir } from "components/shared/Detail/DetailSortHeader";
import { compareValues } from "components/shared/Table/DataTable/tableConfigs";
import { PartnerLedgerEntry } from "models/partner";
import { designTokens, numericSx } from "theme";
import { formatDate, formatDateTime } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { balanceColor } from "utils/partnerUtils";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Box } from "@mui/material";

import { bodyCellSx, EmptyRecords, headCellSx } from "./detailTable";
import DetailTableCard from "./DetailTableCard";
import FilterDropdown from "./FilterDropdown";
import {
	DETAIL_ROWS_PER_PAGE_OPTIONS,
	formatSigned,
	LedgerPeriod,
	useDetailTablePage,
	withinPeriod,
} from "./ledgerHelpers";
import { EventCell, eventLabelKey } from "./ledgerMeta";

type EventFilter = "all" | "sale" | "supply" | "payment" | "refund" | "opening";
type SortCol = "number" | "date" | "event" | "amount" | "balance";

interface LedgerTabProps {
	ledger: PartnerLedgerEntry[];
	partnerName: string;
	onOpenSource: (entry: PartnerLedgerEntry) => void;
}

const matchesEventFilter = (entry: PartnerLedgerEntry, filter: EventFilter): boolean => {
	if (filter === "all") {
		return true;
	}
	if (filter === "refund") {
		return entry.type === "refund-sale" || entry.type === "refund-supply";
	}
	return entry.type === filter;
};

export const LedgerTab: React.FC<LedgerTabProps> = ({ ledger, partnerName, onOpenSource }) => {
	const { t } = useTranslation();
	const [eventFilter, setEventFilter] = useState<EventFilter>("all");
	const [period, setPeriod] = useState<LedgerPeriod>("all");
	const [search, setSearch] = useState("");
	const [sortCol, setSortCol] = useState<SortCol>("date");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	const descriptionText = (e: PartnerLedgerEntry): string =>
		e.type === "opening"
			? t("partner.ledger.openingDesc")
			: `${e.reference ?? ""}${e.itemCount ? ` · ${t("partner.ledger.items", { count: e.itemCount })}` : ""}`;

	const filtered = useMemo(() => {
		const ql = search.trim().toLowerCase();
		return ledger.filter((e) => {
			if (!withinPeriod(e.date, period) || !matchesEventFilter(e, eventFilter)) {
				return false;
			}
			if (!ql) {
				return true;
			}
			const haystack = [t(eventLabelKey(e.type)), descriptionText(e), String(Math.abs(e.delta))]
				.join(" ")
				.toLowerCase();
			return haystack.includes(ql);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ledger, period, eventFilter, search, t]);

	const sorted = useMemo(() => {
		const accessor = (e: PartnerLedgerEntry): string | number => {
			switch (sortCol) {
				case "number":
					return e.reference ?? "";
				case "date":
					return e.date;
				case "event":
					return t(eventLabelKey(e.type));
				case "amount":
					return e.delta;
				case "balance":
					return e.balance;
				default:
					return "";
			}
		};
		const s = [...filtered].sort((a, b) => compareValues(accessor(a), accessor(b)));
		return sortDir === "desc" ? s.reverse() : s;
	}, [filtered, sortCol, sortDir, t]);

	const { page, rowsPerPage, setPage, changeRowsPerPage, paginate } = useDetailTablePage(
		`${eventFilter}|${period}|${search}|${sortCol}|${sortDir}`,
	);
	const rows = paginate(sorted);

	const onSort = (col: SortCol) => {
		if (col === sortCol) {
			setSortDir((d) => (d === "desc" ? "asc" : "desc"));
		} else {
			setSortCol(col);
			setSortDir("desc");
		}
	};

	const handleExport = () => {
		exportToCsv<PartnerLedgerEntry>(
			`partner_${partnerName}_ledger_${csvDateStamp()}`,
			[
				{ header: t("partner.ledger.col.date"), value: (e) => formatDate(e.date) },
				{ header: t("partner.ledger.col.event"), value: (e) => t(eventLabelKey(e.type)) },
				{ header: t("partner.ledger.col.number"), value: (e) => e.reference ?? "" },
				{ header: t("partner.ledger.col.amount"), value: (e) => e.delta },
				{ header: t("partner.ledger.col.balanceAfter"), value: (e) => e.balance },
			],
			filtered,
		);
	};

	return (
		<DetailTableCard
			search={{ value: search, onChange: setSearch, placeholder: t("partner.ledger.search") }}
			filters={
				<>
					<FilterDropdown<EventFilter>
						label={t("partner.ledger.eventFilter")}
						compact
						icon={<FilterListIcon sx={{ fontSize: 15 }} />}
						value={eventFilter}
						onChange={setEventFilter}
						options={[
							{ value: "all", label: t("partner.ledger.event.all") },
							{ value: "sale", label: t("partner.ledger.event.sale") },
							{ value: "supply", label: t("partner.ledger.event.supply") },
							{ value: "payment", label: t("partner.ledger.event.payment") },
							{ value: "refund", label: t("partner.ledger.event.refund") },
							{ value: "opening", label: t("partner.ledger.event.opening") },
						]}
					/>
					<FilterDropdown<LedgerPeriod>
						label={t("partner.ledger.periodFilter")}
						compact
						icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />}
						value={period}
						onChange={setPeriod}
						options={[
							{ value: "all", label: t("partner.ledger.period.all") },
							{ value: "90", label: t("partner.ledger.period.90") },
							{ value: "30", label: t("partner.ledger.period.30") },
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
					icon={<SwapVertIcon sx={{ fontSize: 22 }} />}
					title={t("partner.ledger.empty.title")}
					body={t("partner.ledger.empty.body")}
				/>
			) : (
				<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<DetailSortHeader
								col="number"
								label={t("partner.ledger.col.number")}
								active={sortCol === "number"}
								dir={sortDir}
								onSort={onSort}
								sx={headCellSx}
							/>
							<DetailSortHeader
								col="date"
								label={t("partner.ledger.col.date")}
								active={sortCol === "date"}
								dir={sortDir}
								onSort={onSort}
								sx={headCellSx}
							/>
							<DetailSortHeader
								col="event"
								label={t("partner.ledger.col.event")}
								active={sortCol === "event"}
								dir={sortDir}
								onSort={onSort}
								sx={headCellSx}
							/>
							<DetailSortHeader
								col="amount"
								label={t("partner.ledger.col.amount")}
								active={sortCol === "amount"}
								dir={sortDir}
								onSort={onSort}
								align="right"
								sx={{ ...headCellSx, textAlign: "right" }}
							/>
							<DetailSortHeader
								col="balance"
								label={t("partner.ledger.col.balanceAfter")}
								active={sortCol === "balance"}
								dir={sortDir}
								onSort={onSort}
								align="right"
								sx={{ ...headCellSx, textAlign: "right" }}
							/>
						</tr>
					</thead>
					<tbody>
						{rows.map((e) => {
							const isOpening = e.type === "opening";
							return (
								<Box
									component="tr"
									key={e.id}
									onClick={() => !isOpening && onOpenSource(e)}
									sx={{
										cursor: isOpening ? "default" : "pointer",
										bgcolor: isOpening ? designTokens.primarySoft : "transparent",
										"&:hover": {
											bgcolor: isOpening ? designTokens.primarySoft : designTokens.gray25,
										},
									}}
								>
									<Box component="td" sx={{ ...bodyCellSx, ...numericSx, whiteSpace: "nowrap" }}>
										{e.reference ? (
											<Box
												component="span"
												sx={{
													color: "primary.main",
													fontWeight: 600,
													"&:hover": { textDecoration: "underline" },
												}}
											>
												{e.reference}
											</Box>
										) : (
											<Box component="span" sx={{ color: "text.disabled" }}>
												—
											</Box>
										)}
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											...numericSx,
											color: "text.secondary",
											whiteSpace: "nowrap",
										}}
									>
										{e.type === "opening" ? formatDate(e.date) : formatDateTime(e.date)}
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<EventCell type={e.type} label={t(eventLabelKey(e.type))} />
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											...numericSx,
											fontWeight: 600,
											color: balanceColor(e.delta),
										}}
									>
										{formatSigned(e.delta)}
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											...numericSx,
											fontWeight: 700,
											color: balanceColor(e.balance),
										}}
									>
										{formatSigned(e.balance)}
									</Box>
								</Box>
							);
						})}
					</tbody>
				</Box>
			)}
		</DetailTableCard>
	);
};

export default LedgerTab;
