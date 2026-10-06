import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DateRangeFilter from "components/shared/Date/DateRangeFilter";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import BalanceCell from "components/shared/Table/cells/BalanceCell";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import NoValue from "components/shared/Table/cells/NoValue";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { useTableOrder } from "components/shared/Table/tableOrder";
import { PartnerLedgerEntry } from "models/partner";
import { designTokens } from "theme";
import { ALL_DATES, DateRangeValue, isInDateRange, resolveDateRange } from "utils/dateRange";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { entityNumberSortValue, formatOptionalNumber } from "utils/formatEntityId";

import FilterListIcon from "@mui/icons-material/FilterList";
import SwapVertIcon from "@mui/icons-material/SwapVert";

import { ledgerSourcePath } from "./ledgerHelpers";
import { EventCell, eventLabelKey } from "./ledgerMeta";

type EventFilter = "all" | "sale" | "supply" | "payment" | "refund" | "opening";

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

const isOpening = (e: PartnerLedgerEntry) => e.type === "opening";

/**
 * The partner's book (журнал расчётов): every event with its signed effect and
 * the running balance after it, both from the partner's side (DR-27).
 */
export const LedgerTab: React.FC<LedgerTabProps> = ({ ledger, partnerName, onOpenSource }) => {
	const { t } = useTranslation();
	const tableOrder = useTableOrder<PartnerLedgerEntry>();
	const [eventFilter, setEventFilter] = useState<EventFilter>("all");
	const [period, setPeriod] = useState<DateRangeValue>(ALL_DATES);
	const [search, setSearch] = useState("");

	const filtered = useMemo(() => {
		const ql = search.trim().toLowerCase();
		const range = resolveDateRange(period);
		return ledger.filter((e) => {
			if (!isInDateRange(e.date, range) || !matchesEventFilter(e, eventFilter)) {
				return false;
			}
			if (!ql) {
				return true;
			}
			const haystack = [t(eventLabelKey(e.type)), e.reference ?? "", String(Math.abs(e.delta))]
				.join(" ")
				.toLowerCase();
			return haystack.includes(ql);
		});
	}, [ledger, period, eventFilter, search, t]);

	const columns = useMemo<Column<PartnerLedgerEntry>[]>(
		() => [
			{
				key: "number",
				headerName: t("partner.ledger.col.number"),
				sortValue: (e) => entityNumberSortValue(e.reference),
				renderCell: (e) =>
					isOpening(e) ? (
						<NoValue />
					) : (
						<DocNumberCell number={e.reference} to={ledgerSourcePath(e) ?? undefined} />
					),
			},
			{
				key: "date",
				headerName: t("partner.ledger.col.date"),
				sortValue: (e) => Date.parse(e.date),
				renderCell: (e) => <DateCell value={e.date} kind={isOpening(e) ? "date" : "dateTime"} />,
			},
			{
				key: "event",
				headerName: t("partner.ledger.col.event"),
				sortValue: (e) => t(eventLabelKey(e.type)),
				renderCell: (e) => <EventCell type={e.type} label={t(eventLabelKey(e.type))} />,
			},
			{
				key: "amount",
				headerName: t("partner.ledger.col.amount"),
				align: "right",
				sortValue: (e) => -e.delta,
				renderCell: (e) => <BalanceCell balance={e.delta} />,
			},
			{
				key: "balance",
				headerName: t("partner.ledger.col.balanceAfter"),
				align: "right",
				sortValue: (e) => -e.balance,
				renderCell: (e) => <BalanceCell balance={e.balance} main />,
			},
		],
		[t],
	);

	const handleExport = () => {
		exportToCsv<PartnerLedgerEntry>(
			`partner_${partnerName}_ledger_${csvDateStamp()}`,
			[
				{
					header: t("partner.ledger.col.number"),
					value: (e) => (isOpening(e) ? "" : formatOptionalNumber(e.reference, "")),
				},
				{ header: t("partner.ledger.col.date"), value: (e) => formatDate(e.date) },
				{ header: t("partner.ledger.col.event"), value: (e) => t(eventLabelKey(e.type)) },
				{ header: t("partner.ledger.col.amount"), value: (e) => -e.delta || 0 },
				{ header: t("partner.ledger.col.balanceAfter"), value: (e) => -e.balance || 0 },
			],
			tableOrder.apply(filtered),
		);
	};

	return (
		<DetailTableCard
			search={{ value: search, onChange: setSearch, placeholder: t("partner.ledger.search") }}
			filters={
				<>
					<EntityFilterSelect<EventFilter>
						label={t("partner.ledger.eventLabel")}
						icon={<FilterListIcon />}
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
					<DateRangeFilter value={period} onChange={setPeriod} />
				</>
			}
			exportCsv={{ onExport: handleExport, rowCount: filtered.length }}
		>
			<DetailTable<PartnerLedgerEntry>
				exportOrder={tableOrder}
				rows={filtered}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				pagination
				onRowClick={onOpenSource}
				isRowClickable={(e) => !isOpening(e)}
				rowSx={(e) => (isOpening(e) ? { bgcolor: designTokens.primarySoft } : undefined)}
				empty={
					<TableEmptyState
						icon={<SwapVertIcon />}
						title={t("partner.ledger.empty.title")}
						hint={t("partner.ledger.empty.body")}
					/>
				}
			/>
		</DetailTableCard>
	);
};

export default LedgerTab;
