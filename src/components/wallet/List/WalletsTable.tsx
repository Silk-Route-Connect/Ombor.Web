import React from "react";
import { useTranslation } from "react-i18next";
import ArchivedBadge from "components/product/ArchivedBadge";
import { WalletActionMenu } from "components/wallet/Table/WalletActionMenu";
import { WalletTypeAvatar, WalletTypeBadge } from "components/wallet/WalletPresentation";
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

const headCellSx = {
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	p: "11px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
	bgcolor: "background.paper",
} as const;

const bodyCellSx = {
	p: "13px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;

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
 * Wallet list per the bundle: name · type badge · balance · advances held · "our
 * money", each row opening the full-page detail. Totals live in the summary
 * strip above (rule 31), so there is no totals row; the static pager the
 * prototype drew is omitted (locked pattern 12).
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

	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	const emptyVariant = isFiltering
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
			{rows.length === 0 ? (
				<EmptyState variant={emptyVariant} onCreate={onCreate} />
			) : (
				<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<Box component="th" sx={{ ...headCellSx, pl: "18px" }}>
								{t("wallet.table.name")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("wallet.table.type")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
								{t("wallet.table.balance")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
								{t("wallet.table.advances")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, textAlign: "right", pr: "8px" }}>
								{t("wallet.table.ourMoney")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, width: 56 }} />
						</tr>
					</thead>
					<tbody>
						{rows.map((wallet) => {
							const archived = wallet.isArchived;
							return (
								<Box
									component="tr"
									key={wallet.id}
									onClick={() => onOpen(wallet)}
									sx={{ cursor: "pointer", "&:hover": { bgcolor: designTokens.gray25 } }}
								>
									<Box component="td" sx={{ ...bodyCellSx, pl: "18px" }}>
										<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
											<WalletTypeAvatar type={wallet.type} archived={archived} />
											<Typography
												component="span"
												sx={{
													fontWeight: 600,
													color: archived ? "text.secondary" : "text.primary",
												}}
											>
												{wallet.name}
											</Typography>
											{archived && <ArchivedBadge />}
										</Box>
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<WalletTypeBadge type={wallet.type} />
									</Box>
									<Box component="td" sx={{ ...bodyCellSx, textAlign: "right", ...moneySx }}>
										{formatCurrency(wallet.balance)}
									</Box>
									<Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
										{wallet.advancesHeld > 0 ? (
											<Box component="span" sx={{ ...moneySx, color: designTokens.saffron700 }}>
												{formatCurrency(wallet.advancesHeld)}
											</Box>
										) : (
											<Box component="span" sx={{ color: designTokens.gray400, fontWeight: 600 }}>
												—
											</Box>
										)}
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											pr: "8px",
											...moneySx,
											color: "success.main",
										}}
									>
										{formatCurrency(wallet.ourMoney)}
										<UzsSuffix />
									</Box>
									<Box
										component="td"
										sx={{ ...bodyCellSx, textAlign: "right" }}
										onClick={(e) => e.stopPropagation()}
									>
										<WalletActionMenu
											wallet={wallet}
											onEdit={() => onEdit(wallet)}
											onArchive={() => onArchive(wallet)}
											onRestore={() => onRestore(wallet)}
										/>
									</Box>
								</Box>
							);
						})}
					</tbody>
				</Box>
			)}
		</Paper>
	);
};

export default WalletsTable;
