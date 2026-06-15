import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { WalletTypeAvatar } from "components/wallet/WalletPresentation";
import { WalletTransfer } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import AddIcon from "@mui/icons-material/Add";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Box, Paper, Typography } from "@mui/material";

interface WalletTransfersTabProps {
	transfers: WalletTransfer[];
	canTransfer: boolean;
	onNewTransfer: () => void;
	onOpenTransfer: (transferId: number) => void;
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

const WalletCell: React.FC<{ name: string; type: WalletTransfer["fromWalletType"] }> = ({
	name,
	type,
}) => (
	<Box sx={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
		<WalletTypeAvatar type={type} size={24} iconSize={14} />
		{name}
	</Box>
);

/**
 * The «Переводы» tab: inter-wallet transfers touching this wallet, with the
 * «Новый перевод» child-event action. Each row opens the read-only transfer
 * detail (transfers are immutable — rule 16).
 */
export const WalletTransfersTab: React.FC<WalletTransfersTabProps> = ({
	transfers,
	canTransfer,
	onNewTransfer,
	onOpenTransfer,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
				<Box sx={{ flexGrow: 1 }} />
				{canTransfer && (
					<PrimaryButton icon={<AddIcon />} onClick={onNewTransfer}>
						{t("wallet.transfer.action")}
					</PrimaryButton>
				)}
			</Box>

			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				{transfers.length === 0 ? (
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
				) : (
					<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr>
								<Box component="th" sx={{ ...headCellSx, pl: "18px" }}>
									{t("wallet.transfers.date")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("wallet.transfers.from")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("wallet.transfers.to")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
									{t("wallet.transfers.amount")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, pr: "18px" }}>
									{t("wallet.transfers.createdBy")}
								</Box>
							</tr>
						</thead>
						<tbody>
							{transfers.map((transfer) => (
								<Box
									component="tr"
									key={transfer.id}
									onClick={() => onOpenTransfer(transfer.id)}
									sx={{ cursor: "pointer", "&:hover": { bgcolor: designTokens.gray25 } }}
								>
									<Box
										component="td"
										sx={{ ...bodyCellSx, pl: "18px", ...numericSx, color: "text.secondary" }}
									>
										{formatDate(transfer.date)}
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<WalletCell name={transfer.fromWalletName} type={transfer.fromWalletType} />
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<WalletCell name={transfer.toWalletName} type={transfer.toWalletType} />
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											...numericSx,
											fontWeight: 700,
											fontSize: 15,
										}}
									>
										{formatCurrency(transfer.amount)}
									</Box>
									<Box component="td" sx={{ ...bodyCellSx, pr: "18px", color: "text.secondary" }}>
										{transfer.createdBy}
									</Box>
								</Box>
							))}
						</tbody>
					</Box>
				)}
			</Paper>
		</>
	);
};

export default WalletTransfersTab;
