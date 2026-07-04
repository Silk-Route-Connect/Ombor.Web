import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { WalletActionMenu } from "components/wallet/Table/WalletActionMenu";
import {
	WALLET_TYPE_META,
	WalletTypeAvatar,
	WalletTypeBadge,
} from "components/wallet/WalletPresentation";
import { Loadable } from "helpers/Loading";
import { Wallet } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";

interface WalletsTableProps {
	rows: Loadable<Wallet[]>;
	showArchived: boolean;
	isFiltering: boolean;
	/** Whether any wallet exists at all (drives the empty-state copy). */
	hasAny: boolean;
	/** Whether any active (non-archived) wallet exists. */
	hasActive: boolean;
	onOpen: (wallet: Wallet) => void;
	onCreate: () => void;
	onEdit: (wallet: Wallet) => void;
	onArchive: (wallet: Wallet) => void;
	onRestore: (wallet: Wallet) => void;
}

const moneySx = { ...numericSx, fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" } as const;

const UzsSuffix: React.FC = () => (
	<Box component="span" sx={{ color: "text.disabled", fontWeight: 600, fontSize: 12, ml: "4px" }}>
		UZS
	</Box>
);

const EmptyState: React.FC<{
	variant: "filtering" | "empty" | "allArchived";
	onCreate: () => void;
}> = ({ variant, onCreate }) => {
	const { t } = useTranslation();

	const copy = {
		filtering: { title: t("wallet.empty.searchTitle"), body: t("wallet.empty.searchBody") },
		empty: { title: t("wallet.empty.title"), body: t("wallet.empty.body") },
		allArchived: {
			title: t("wallet.empty.allArchivedTitle"),
			body: t("wallet.empty.allArchivedBody"),
		},
	}[variant];

	return (
		<Box sx={{ p: "52px 24px 58px", textAlign: "center" }}>
			<Box
				sx={{
					width: 56,
					height: 56,
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
				<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 26 }} />
			</Box>
			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{copy.title}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 400, mx: "auto", lineHeight: 1.6 }}
			>
				{copy.body}
			</Typography>
			{variant === "empty" && (
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 2.5 }}>
					{t("wallet.create")}
				</Button>
			)}
		</Box>
	);
};

/**
 * Wallet list on the shared DataTable (warm band, sortable columns, 10/25/50
 * pager, name-asc default): name · type badge · balance · advances held · «our
 * money», each row opening the full-page detail; row actions in the shared ⋮
 * menu. Totals live in the summary strip above (rule 31), so there is no totals
 * row.
 */
export const WalletsTable: React.FC<WalletsTableProps> = ({
	rows,
	showArchived,
	isFiltering,
	hasAny,
	hasActive,
	onOpen,
	onCreate,
	onEdit,
	onArchive,
	onRestore,
}) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<Wallet>[]>(
		() => [
			{
				key: "name",
				headerName: t("wallet.table.name"),
				sortValue: (w) => w.name,
				renderCell: (w) => (
					<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
						<WalletTypeAvatar type={w.type} archived={w.isArchived} />
						<Typography
							component="span"
							sx={{ fontWeight: 600, color: w.isArchived ? "text.secondary" : "text.primary" }}
						>
							{w.name}
						</Typography>
						{w.isArchived && <ArchivedBadge />}
					</Box>
				),
			},
			{
				key: "type",
				headerName: t("wallet.table.type"),
				sortValue: (w) => t(WALLET_TYPE_META[w.type].labelKey),
				renderCell: (w) => <WalletTypeBadge type={w.type} />,
			},
			{
				key: "balance",
				headerName: t("wallet.table.balance"),
				align: "right",
				sortValue: (w) => w.balance,
				renderCell: (w) => (
					<Box component="span" sx={moneySx}>
						{formatCurrency(w.balance)}
					</Box>
				),
			},
			{
				key: "advances",
				headerName: t("wallet.table.advances"),
				align: "right",
				sortValue: (w) => w.advancesHeld,
				renderCell: (w) =>
					w.advancesHeld > 0 ? (
						<Box component="span" sx={{ ...moneySx, color: designTokens.saffron700 }}>
							{formatCurrency(w.advancesHeld)}
						</Box>
					) : (
						<Box component="span" sx={{ color: designTokens.gray400, fontWeight: 600 }}>
							—
						</Box>
					),
			},
			{
				key: "ourMoney",
				headerName: t("wallet.table.ourMoney"),
				align: "right",
				sortValue: (w) => w.ourMoney,
				renderCell: (w) => (
					<Box component="span" sx={{ ...moneySx, color: "success.main" }}>
						{formatCurrency(w.ourMoney)}
						<UzsSuffix />
					</Box>
				),
			},
			{
				key: "actions",
				headerName: "",
				align: "right",
				width: 56,
				renderCell: (w) => (
					<WalletActionMenu
						wallet={w}
						onEdit={() => onEdit(w)}
						onArchive={() => onArchive(w)}
						onRestore={() => onRestore(w)}
					/>
				),
			},
		],
		[t, onEdit, onArchive, onRestore],
	);

	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (rows.length === 0) {
		const variant = isFiltering
			? "filtering"
			: !hasAny
				? "empty"
				: !hasActive && !showArchived
					? "allArchived"
					: "filtering";
		return (
			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				<EmptyState variant={variant} onCreate={onCreate} />
			</Paper>
		);
	}

	return (
		<DataTable<Wallet>
			rows={rows}
			columns={columns}
			pagination
			defaultSort={{ key: "name", order: "asc" }}
			onRowClick={onOpen}
		/>
	);
};

export default WalletsTable;
