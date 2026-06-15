import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { WalletTypeAvatar } from "components/wallet/WalletPresentation";
import { WalletTransfer } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";

interface WalletTransferDetailModalProps {
	transfer: WalletTransfer | null;
	onClose: () => void;
}

const RouteNode: React.FC<{
	label: string;
	name: string;
	type: WalletTransfer["fromWalletType"];
}> = ({ label, name, type }) => (
	<Box sx={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
		<WalletTypeAvatar type={type} size={30} iconSize={16} />
		<Box sx={{ minWidth: 0 }}>
			<Typography sx={{ fontSize: 11, color: "text.disabled" }}>{label}</Typography>
			<Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{name}</Typography>
		</Box>
	</Box>
);

const KvRow: React.FC<{ label: string; children: React.ReactNode; last?: boolean }> = ({
	label,
	children,
	last,
}) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: "16px",
			py: "13px",
			borderBottom: last ? "none" : "1px solid",
			borderColor: "divider",
		}}
	>
		<Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
		<Box sx={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>{children}</Box>
	</Box>
);

/**
 * Read-only inter-wallet transfer detail per the bundle: a from → to route
 * header and a key/value list. Transfers are immutable (rule 16) — no actions
 * beyond «Закрыть».
 */
export const WalletTransferDetailModal: React.FC<WalletTransferDetailModalProps> = ({
	transfer,
	onClose,
}) => {
	const { t } = useTranslation();

	if (!transfer) {
		return null;
	}

	return (
		<Dialog
			open
			onClose={onClose}
			disableRestoreFocus
			slotProps={{ paper: { sx: { width: 480, maxWidth: "94%", borderRadius: "12px" } } }}
		>
			<FormDialogHeader
				title={t("wallet.transfer.detailTitle")}
				subtitle={formatDate(transfer.date)}
				disabled={false}
				onClose={onClose}
			/>

			<DialogContent dividers sx={{ pt: 2 }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
						p: "14px 16px",
						mb: "20px",
						bgcolor: designTokens.gray25,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: "12px",
					}}
				>
					<RouteNode
						label={t("wallet.transfer.from")}
						name={transfer.fromWalletName}
						type={transfer.fromWalletType}
					/>
					<ChevronRightIcon sx={{ fontSize: 18, color: "primary.main", flex: "0 0 auto" }} />
					<RouteNode
						label={t("wallet.transfer.to")}
						name={transfer.toWalletName}
						type={transfer.toWalletType}
					/>
				</Box>

				<KvRow label={t("wallet.transfer.amount")}>
					<Box
						component="span"
						sx={{ ...numericSx, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}
					>
						{formatCurrency(transfer.amount)} UZS
					</Box>
				</KvRow>
				<KvRow label={t("wallet.transfer.date")}>
					<Box component="span" sx={numericSx}>
						{formatDate(transfer.date)}
					</Box>
				</KvRow>
				<KvRow label={t("wallet.transfer.createdBy")}>{transfer.createdBy}</KvRow>
				<KvRow label={t("wallet.transfer.note")} last>
					<Box
						component="span"
						sx={{ fontWeight: 500, color: transfer.note ? "text.primary" : "text.disabled" }}
					>
						{transfer.note ?? "—"}
					</Box>
				</KvRow>
			</DialogContent>

			<DialogActions
				sx={{
					px: "24px",
					py: "14px",
					gap: "10px",
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.gray25,
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "7px",
						fontSize: 12.5,
						color: "text.secondary",
					}}
				>
					<InfoOutlinedIcon sx={{ fontSize: 15, color: "info.main" }} />
					{t("wallet.transfer.detailImmutable")}
				</Box>
				<Box sx={{ flexGrow: 1 }} />
				<GhostButton onClick={onClose}>{t("close")}</GhostButton>
			</DialogActions>
		</Dialog>
	);
};

export default WalletTransferDetailModal;
