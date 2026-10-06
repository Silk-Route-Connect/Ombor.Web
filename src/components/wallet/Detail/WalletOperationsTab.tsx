import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import { PAYMENT_TYPE_META, PaymentTypeBadge } from "components/payment/PaymentPresentation";
import StatusPill from "components/shared/Chip/StatusPill";
import DateRangeFilter from "components/shared/Date/DateRangeFilter";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import DirectionBadge from "components/shared/DirectionBadge/DirectionBadge";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import NoValue from "components/shared/Table/cells/NoValue";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { useTableOrder } from "components/shared/Table/tableOrder";
import TableTotals from "components/shared/Table/TableTotals";
import { WalletOperation, WalletOperationDirection } from "models/wallet";
import { paymentDetailPath } from "routing/paths";
import { ALL_DATES, DateRangeValue, filterByDateRange, isDateRangeActive } from "utils/dateRange";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatQuantity } from "utils/formatCurrency";
import { entityNumberSortValue, formatEntityId, formatOptionalNumber } from "utils/formatEntityId";
import { directionTotals } from "utils/listTotals";
import { matchesSearch } from "utils/stringUtils";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Stack } from "@mui/material";

type DirFilter = "all" | WalletOperationDirection;

interface WalletOperationsTabProps {
	walletName: string;
	operations: WalletOperation[];
	onOpenPayment: (operation: WalletOperation) => void;
	onOpenTransfer: (transferId: number) => void;
}

/** A payment row shows its payment number; a transfer row its transfer №; others none. */
const OperationNumber: React.FC<{
	operation: WalletOperation;
	onOpenTransfer: (id: number) => void;
}> = ({ operation: o, onOpenTransfer }) => {
	if (o.paymentId != null) {
		return <DocNumberCell number={o.paymentNumber} to={paymentDetailPath(o.paymentId)} />;
	}
	if (o.transferId != null) {
		const transferId = o.transferId;
		return <DocNumberCell number={transferId} onOpen={() => onOpenTransfer(transferId)} />;
	}
	return <NoValue />;
};

/**
 * «Операции»: every money movement of the wallet — № · Дата · Партнёр · Тип ·
 * Направление · Сумма · Баланс после. Amounts are unsigned and coloured by
 * direction (pattern 4); a payment row opens the payment, a transfer row the
 * transfer.
 */
export const WalletOperationsTab: React.FC<WalletOperationsTabProps> = ({
	walletName,
	operations,
	onOpenPayment,
	onOpenTransfer,
}) => {
	const { t } = useTranslation();
	const tableOrder = useTableOrder<WalletOperation>();
	const [query, setQuery] = useState("");
	const [dir, setDir] = useState<DirFilter>("all");
	const [dateRange, setDateRange] = useState<DateRangeValue>(ALL_DATES);
	const filtering = query.trim().length > 0 || dir !== "all" || isDateRangeActive(dateRange);

	const rows = useMemo(
		() =>
			filterByDateRange(operations, dateRange, (o) => o.date).filter(
				(o) =>
					(dir === "all" || o.direction === dir) &&
					(!query.trim() || matchesSearch(o.party, query) || matchesSearch(o.paymentNumber, query)),
			),
		[operations, query, dir, dateRange],
	);
	const totals = directionTotals(
		rows,
		(o) => o.amount,
		(o) => o.direction === "In",
	);

	// Legacy API builds serve only the coarse `kind`; prefer the payment type when present.
	const typeLabel = useCallback(
		(o: WalletOperation): string =>
			o.paymentType && PAYMENT_TYPE_META[o.paymentType]
				? t(PAYMENT_TYPE_META[o.paymentType].labelKey)
				: t(`wallet.operation.${o.kind}`),
		[t],
	);

	const numberOf = (o: WalletOperation): string => {
		if (o.paymentId != null) return formatOptionalNumber(o.paymentNumber, t("common.noNumber"));
		return o.transferId != null ? formatEntityId(o.transferId) : "";
	};

	const columns = useMemo<Column<WalletOperation>[]>(
		() => [
			{
				key: "number",
				headerName: t("wallet.operations.payment"),
				sortValue: (o) =>
					o.paymentId != null ? entityNumberSortValue(o.paymentNumber) : (o.transferId ?? null),
				renderCell: (o) => <OperationNumber operation={o} onOpenTransfer={onOpenTransfer} />,
			},
			{
				key: "date",
				headerName: t("wallet.operations.date"),
				sortValue: (o) => Date.parse(o.date),
				renderCell: (o) => <DateCell value={o.date} />,
			},
			{
				key: "party",
				headerName: t("wallet.operations.party"),
				sortValue: (o) => o.party ?? "",
				renderCell: (o) =>
					o.partnerId != null && o.party ? (
						<PartnerLink id={o.partnerId} name={o.party} />
					) : (
						<MutedTextCell text={o.party} />
					),
			},
			{
				key: "type",
				headerName: t("wallet.operations.type"),
				sortValue: typeLabel,
				renderCell: (o) =>
					o.paymentType && PAYMENT_TYPE_META[o.paymentType] ? (
						<PaymentTypeBadge type={o.paymentType} />
					) : (
						<StatusPill token="neutral" label={typeLabel(o)} />
					),
			},
			{
				key: "direction",
				headerName: t("wallet.operations.direction"),
				sortValue: (o) =>
					t(o.direction === "In" ? "wallet.operations.in" : "wallet.operations.out"),
				renderCell: (o) => (
					<DirectionBadge
						income={o.direction === "In"}
						label={t(o.direction === "In" ? "wallet.operations.in" : "wallet.operations.out")}
					/>
				),
			},
			{
				key: "amount",
				headerName: t("wallet.operations.amount"),
				align: "right",
				sortValue: (o) => o.amount,
				renderCell: (o) => (
					<MoneyCell value={o.amount} main tone={o.direction === "In" ? "income" : "expense"} />
				),
			},
			{
				key: "balanceAfter",
				headerName: t("wallet.operations.balanceAfter"),
				align: "right",
				sortValue: (o) => o.balanceAfter,
				renderCell: (o) => <MoneyCell value={o.balanceAfter} />,
			},
		],
		[t, typeLabel, onOpenTransfer],
	);

	const handleRowClick = (o: WalletOperation): void => {
		if (o.transferId != null) {
			onOpenTransfer(o.transferId);
		} else {
			onOpenPayment(o);
		}
	};

	const handleExport = () => {
		exportToCsv<WalletOperation>(
			`wallet_${walletName}_operations_${csvDateStamp()}`,
			[
				{ header: t("wallet.operations.payment"), value: numberOf },
				{ header: t("wallet.operations.date"), value: (o) => formatDate(o.date) },
				{ header: t("wallet.operations.party"), value: (o) => o.party ?? "" },
				{ header: t("wallet.operations.type"), value: typeLabel },
				{
					header: t("wallet.operations.direction"),
					value: (o) => t(o.direction === "In" ? "wallet.operations.in" : "wallet.operations.out"),
				},
				{ header: t("wallet.operations.amount"), value: (o) => o.amount },
				{ header: t("wallet.operations.balanceAfter"), value: (o) => o.balanceAfter },
			],
			tableOrder.apply(rows),
		);
	};

	return (
		<DetailTableCard
			search={{
				value: query,
				onChange: setQuery,
				placeholder: t("wallet.operations.searchPlaceholder"),
			}}
			filters={
				<Stack direction="row" sx={{ gap: "10px", flexWrap: "wrap" }}>
					<SegmentedControl<DirFilter>
						options={[
							{ value: "all", label: t("wallet.operations.filterAll") },
							{ value: "In", label: t("wallet.operations.in") },
							{ value: "Out", label: t("wallet.operations.out") },
						]}
						value={dir}
						onChange={setDir}
					/>
					<DateRangeFilter value={dateRange} onChange={setDateRange} />
				</Stack>
			}
			exportCsv={{ onExport: handleExport, rowCount: rows.length }}
		>
			<DetailTable<WalletOperation>
				exportOrder={tableOrder}
				rows={rows}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				pagination
				onRowClick={handleRowClick}
				summary={
					<TableTotals
						count={t("wallet.operations.totalsCount", {
							count: totals.count,
							formatted: formatQuantity(totals.count),
						})}
						items={[
							{ label: t("common.totals.income"), value: totals.income, tone: "income" },
							{ label: t("common.totals.expense"), value: totals.expense, tone: "expense" },
						]}
					/>
				}
				empty={
					<TableEmptyState
						icon={<SwapHorizIcon />}
						title={t("wallet.operations.emptyTitle")}
						hint={
							filtering ? t("wallet.operations.emptyFiltered") : t("wallet.operations.emptyBody")
						}
					/>
				}
			/>
		</DetailTableCard>
	);
};

export default WalletOperationsTab;
