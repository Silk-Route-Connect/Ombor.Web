import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { useTableOrder } from "components/shared/Table/tableOrder";
import WalletLink from "components/wallet/Links/WalletLink";
import { WalletTransfer } from "models/wallet";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatEntityId } from "utils/formatEntityId";
import { matchesSearch } from "utils/stringUtils";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

interface WalletTransfersTabProps {
	walletName: string;
	transfers: WalletTransfer[];
	canTransfer: boolean;
	onNewTransfer: () => void;
	onOpenTransfer: (transferId: number) => void;
}

/**
 * «Переводы»: inter-wallet transfers touching this wallet (immutable, rule 16)
 * — № · Дата · Из кассы · В кассу · Автор · Сумма. Each row opens the
 * read-only transfer detail.
 */
export const WalletTransfersTab: React.FC<WalletTransfersTabProps> = ({
	walletName,
	transfers,
	canTransfer,
	onNewTransfer,
	onOpenTransfer,
}) => {
	const { t } = useTranslation();
	const tableOrder = useTableOrder<WalletTransfer>();
	const [query, setQuery] = useState("");

	const rows = useMemo(
		() =>
			query.trim()
				? transfers.filter((tr) =>
						matchesSearch([tr.fromWalletName, tr.toWalletName, tr.createdBy].join(" "), query),
					)
				: transfers,
		[transfers, query],
	);

	const columns = useMemo<Column<WalletTransfer>[]>(
		() => [
			{
				key: "number",
				headerName: t("wallet.transfers.number"),
				sortValue: (tr) => tr.id,
				renderCell: (tr) => <DocNumberCell number={tr.id} onOpen={() => onOpenTransfer(tr.id)} />,
			},
			{
				key: "date",
				headerName: t("wallet.transfers.date"),
				sortValue: (tr) => Date.parse(tr.date),
				renderCell: (tr) => <DateCell value={tr.date} />,
			},
			{
				key: "from",
				headerName: t("wallet.transfers.from"),
				sortValue: (tr) => tr.fromWalletName,
				renderCell: (tr) => <WalletLink id={tr.fromWalletId} name={tr.fromWalletName} />,
			},
			{
				key: "to",
				headerName: t("wallet.transfers.to"),
				sortValue: (tr) => tr.toWalletName,
				renderCell: (tr) => <WalletLink id={tr.toWalletId} name={tr.toWalletName} />,
			},
			{
				key: "createdBy",
				headerName: t("wallet.transfers.createdBy"),
				sortValue: (tr) => tr.createdBy,
				renderCell: (tr) => <MutedTextCell text={tr.createdBy} />,
			},
			{
				key: "amount",
				headerName: t("wallet.transfers.amount"),
				align: "right",
				sortValue: (tr) => tr.amount,
				renderCell: (tr) => <MoneyCell value={tr.amount} main />,
			},
		],
		[t, onOpenTransfer],
	);

	const handleExport = () => {
		exportToCsv<WalletTransfer>(
			`wallet_${walletName}_transfers_${csvDateStamp()}`,
			[
				{ header: t("wallet.transfers.number"), value: (tr) => formatEntityId(tr.id) },
				{ header: t("wallet.transfers.date"), value: (tr) => formatDate(tr.date) },
				{ header: t("wallet.transfers.from"), value: (tr) => tr.fromWalletName },
				{ header: t("wallet.transfers.to"), value: (tr) => tr.toWalletName },
				{ header: t("wallet.transfers.createdBy"), value: (tr) => tr.createdBy },
				{ header: t("wallet.transfers.amount"), value: (tr) => tr.amount },
			],
			tableOrder.apply(rows),
		);
	};

	const firstRun = transfers.length === 0;

	return (
		<DetailTableCard
			search={
				firstRun
					? undefined
					: {
							value: query,
							onChange: setQuery,
							placeholder: t("wallet.transfers.searchPlaceholder"),
						}
			}
			exportCsv={firstRun ? undefined : { onExport: handleExport, rowCount: rows.length }}
		>
			<DetailTable<WalletTransfer>
				exportOrder={tableOrder}
				rows={rows}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				pagination
				onRowClick={(tr) => onOpenTransfer(tr.id)}
				empty={
					<TableEmptyState
						icon={<SwapHorizIcon />}
						title={firstRun ? t("wallet.transfers.emptyTitle") : t("common.table.noMatches")}
						hint={firstRun ? t("wallet.transfers.emptyBody") : t("common.table.noMatchesHint")}
						action={
							firstRun && canTransfer
								? { label: t("wallet.transfer.action"), onClick: onNewTransfer }
								: undefined
						}
					/>
				}
			/>
		</DetailTableCard>
	);
};

export default WalletTransfersTab;
