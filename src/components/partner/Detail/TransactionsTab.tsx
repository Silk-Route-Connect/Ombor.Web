import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PaymentStatusChip from "components/shared/Chip/PaymentStatusChip";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import NoValue from "components/shared/Table/cells/NoValue";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { useTableOrder } from "components/shared/Table/tableOrder";
import { PartnerLedgerEntry } from "models/partner";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { entityNumberSortValue, formatOptionalNumber } from "utils/formatEntityId";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import { ledgerSourcePath } from "./ledgerHelpers";
import { EventCell, eventLabelKey } from "./ledgerMeta";

type TypeFilter = "all" | "sale" | "supply" | "refund";
type StatusFilter = "all" | "open" | "paid" | "partial" | "unpaid";

interface TransactionsTabProps {
	transactions: PartnerLedgerEntry[];
	partnerName: string;
	initialStatus?: StatusFilter;
	onOpen: (entry: PartnerLedgerEntry) => void;
}

const isRefund = (e: PartnerLedgerEntry) => e.type === "refund-sale" || e.type === "refund-supply";

/** The document's amount as its «Сумма» cell reads it: a refund below zero. */
const signedAmount = (e: PartnerLedgerEntry) => (isRefund(e) ? -1 : 1) * Math.abs(e.delta);

/** A status chip only for a document that carries one (refunds and done rows do not). */
const hasStatus = (e: PartnerLedgerEntry) => !isRefund(e) && !!e.status && e.status !== "done";

/**
 * The partner's sales, supplies and refunds in the canonical column order
 * (conventions.md → Tables): № · Дата · Тип · Статус · Позиций · Сумма.
 */
export const TransactionsTab: React.FC<TransactionsTabProps> = ({
	transactions,
	partnerName,
	initialStatus,
	onOpen,
}) => {
	const { t } = useTranslation();
	const tableOrder = useTableOrder<PartnerLedgerEntry>();
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
	}, [transactions, type, status, search, t]);

	const columns = useMemo<Column<PartnerLedgerEntry>[]>(
		() => [
			{
				key: "number",
				headerName: t("partner.txns.col.number"),
				sortValue: (tx) => entityNumberSortValue(tx.reference),
				renderCell: (tx) => (
					<DocNumberCell number={tx.reference} to={ledgerSourcePath(tx) ?? undefined} />
				),
			},
			{
				key: "date",
				headerName: t("partner.txns.col.date"),
				sortValue: (tx) => Date.parse(tx.date),
				renderCell: (tx) => <DateCell value={tx.date} />,
			},
			{
				key: "type",
				headerName: t("partner.txns.col.type"),
				sortValue: (tx) => t(eventLabelKey(tx.type)),
				renderCell: (tx) => <EventCell type={tx.type} label={t(eventLabelKey(tx.type))} />,
			},
			{
				key: "status",
				headerName: t("partner.txns.col.status"),
				sortValue: (tx) => (hasStatus(tx) ? t(`partner.txns.status.${tx.status}`) : null),
				renderCell: (tx) =>
					hasStatus(tx) && tx.status && tx.status !== "done" ? (
						<PaymentStatusChip status={tx.status} />
					) : (
						<NoValue />
					),
			},
			{
				key: "positions",
				headerName: t("partner.txns.col.positions"),
				align: "right",
				sortValue: (tx) => tx.itemCount ?? null,
				renderCell: (tx) => <QuantityCell value={tx.itemCount} />,
			},
			{
				key: "amount",
				headerName: t("partner.txns.col.amount"),
				align: "right",
				sortValue: (tx) => signedAmount(tx),
				// A refund reads «−…» as on /sales and /supplies (D12).
				renderCell: (tx) => <MoneyCell value={Math.abs(tx.delta)} main negative={isRefund(tx)} />,
			},
		],
		[t],
	);

	const handleExport = () => {
		exportToCsv<PartnerLedgerEntry>(
			`partner_${partnerName}_transactions_${csvDateStamp()}`,
			[
				{
					header: t("partner.txns.col.number"),
					value: (tx) => formatOptionalNumber(tx.reference, ""),
				},
				{ header: t("partner.txns.col.date"), value: (tx) => formatDate(tx.date) },
				{ header: t("partner.txns.col.type"), value: (tx) => t(eventLabelKey(tx.type)) },
				{
					header: t("partner.txns.col.status"),
					value: (tx) => (hasStatus(tx) ? t(`partner.txns.status.${tx.status}`) : ""),
				},
				{ header: t("partner.txns.col.positions"), value: (tx) => tx.itemCount ?? "" },
				{ header: t("partner.txns.col.amount"), value: (tx) => signedAmount(tx) },
			],
			tableOrder.apply(filtered),
		);
	};

	return (
		<DetailTableCard
			search={{ value: search, onChange: setSearch, placeholder: t("partner.txns.search") }}
			filters={
				<>
					<EntityFilterSelect<TypeFilter>
						label={t("partner.txns.typeFilter")}
						icon={<FilterListIcon />}
						value={type}
						onChange={setType}
						options={[
							{ value: "all", label: t("partner.txns.type.all") },
							{ value: "sale", label: t("partner.txns.type.sale") },
							{ value: "supply", label: t("partner.txns.type.supply") },
							{ value: "refund", label: t("partner.txns.type.refund") },
						]}
					/>
					<EntityFilterSelect<StatusFilter>
						label={t("partner.txns.statusFilter")}
						icon={<CheckCircleOutlineIcon />}
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
			exportCsv={{ onExport: handleExport, rowCount: filtered.length }}
		>
			<DetailTable<PartnerLedgerEntry>
				exportOrder={tableOrder}
				rows={filtered}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				pagination
				storageKey="transactions"
				onRowClick={onOpen}
				empty={
					<TableEmptyState
						icon={<ReceiptLongOutlinedIcon />}
						title={t("partner.txns.empty.title")}
						hint={t("partner.txns.empty.body")}
					/>
				}
			/>
		</DetailTableCard>
	);
};

export default TransactionsTab;
