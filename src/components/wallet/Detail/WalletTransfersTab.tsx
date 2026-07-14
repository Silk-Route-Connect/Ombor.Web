import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import WalletLink from "components/wallet/Links/WalletLink";
import { WalletTypeAvatar } from "components/wallet/WalletPresentation";
import { WalletTransfer } from "models/wallet";
import { numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { matchesSearch } from "utils/stringUtils";

import AddIcon from "@mui/icons-material/Add";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Box, Paper, Typography } from "@mui/material";

interface WalletTransfersTabProps {
	transfers: WalletTransfer[];
	canTransfer: boolean;
	onNewTransfer: () => void;
	onOpenTransfer: (transferId: number) => void;
}

const stop = (e: React.MouseEvent) => e.stopPropagation();

const WalletCell: React.FC<{
	id: number;
	name: string;
	type: WalletTransfer["fromWalletType"];
}> = ({ id, name, type }) => (
	<Box
		component="span"
		sx={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
		onClick={stop}
	>
		<WalletTypeAvatar type={type} size={24} iconSize={14} />
		<WalletLink id={id} name={name} />
	</Box>
);

/**
 * The «Переводы» tab on the shared DataTable — inter-wallet transfers touching
 * this wallet (immutable, rule 16). Each row opens the read-only transfer
 * detail; the «Новый перевод» action lives in the detail header (WAL-13).
 */
export const WalletTransfersTab: React.FC<WalletTransfersTabProps> = ({
	transfers,
	canTransfer,
	onNewTransfer,
	onOpenTransfer,
}) => {
	const { t } = useTranslation();
	const [query, setQuery] = useState("");

	const columns = useMemo<Column<WalletTransfer>[]>(
		() => [
			{
				key: "date",
				headerName: t("wallet.transfers.date"),
				sortValue: (tr) => tr.date,
				renderCell: (tr) => (
					<Box
						component="span"
						sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
					>
						{formatDateTime(tr.date)}
					</Box>
				),
			},
			{
				key: "from",
				headerName: t("wallet.transfers.from"),
				sortValue: (tr) => tr.fromWalletName,
				renderCell: (tr) => (
					<WalletCell id={tr.fromWalletId} name={tr.fromWalletName} type={tr.fromWalletType} />
				),
			},
			{
				key: "to",
				headerName: t("wallet.transfers.to"),
				sortValue: (tr) => tr.toWalletName,
				renderCell: (tr) => (
					<WalletCell id={tr.toWalletId} name={tr.toWalletName} type={tr.toWalletType} />
				),
			},
			{
				key: "amount",
				headerName: t("wallet.transfers.amount"),
				align: "right",
				sortValue: (tr) => tr.amount,
				renderCell: (tr) => (
					<Box component="span" sx={{ ...numericSx, fontWeight: 700, fontSize: 15 }}>
						{formatCurrency(tr.amount)}
					</Box>
				),
			},
			{
				key: "createdBy",
				headerName: t("wallet.transfers.createdBy"),
				sortValue: (tr) => tr.createdBy,
				renderCell: (tr) => (
					<Box component="span" sx={{ color: "text.secondary" }}>
						{tr.createdBy}
					</Box>
				),
			},
		],
		[t],
	);

	const filtered = useMemo(
		() =>
			query.trim()
				? transfers.filter((tr) =>
						matchesSearch([tr.fromWalletName, tr.toWalletName, tr.createdBy].join(" "), query),
					)
				: transfers,
		[transfers, query],
	);

	if (transfers.length === 0) {
		return (
			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				<Box sx={{ p: "44px 24px 48px", textAlign: "center" }}>
					<SwapHorizIcon sx={{ fontSize: 26, color: "text.disabled" }} />
					<Typography sx={{ fontWeight: 600, mt: 1 }}>
						{t("wallet.transfers.emptyTitle")}
					</Typography>
					<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
						{t("wallet.transfers.emptyBody")}
					</Typography>
					{canTransfer && (
						<GhostButton
							icon={<AddIcon sx={{ fontSize: "18px !important" }} />}
							onClick={onNewTransfer}
							sx={{ mt: 2 }}
						>
							{t("wallet.transfer.action")}
						</GhostButton>
					)}
				</Box>
			</Paper>
		);
	}

	return (
		<Box>
			<Box sx={{ mb: "12px" }}>
				<SearchInput
					value={query}
					onChange={setQuery}
					placeholder={t("wallet.transfers.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 300 } }}
				/>
			</Box>
			<DataTable<WalletTransfer>
				rows={filtered}
				columns={columns}
				pagination
				defaultSort={{ key: "date", order: "desc" }}
				onRowClick={(tr) => onOpenTransfer(tr.id)}
			/>
		</Box>
	);
};

export default WalletTransfersTab;
