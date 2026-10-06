import React from "react";
import { useTranslation } from "react-i18next";
import FactRow, { FactList } from "components/shared/Detail/FactRow";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import { recordTile } from "components/shared/IconTile/recordTile";
import UzsUnit from "components/shared/Money/UzsUnit";
import { WalletTypeAvatar } from "components/wallet/WalletPresentation";
import { WalletTransfer } from "models/wallet";
import { designTokens, numericSx, radius } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Typography } from "@mui/material";

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
			<Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
			<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{name}</Typography>
		</Box>
	</Box>
);

/**
 * Read-only inter-wallet transfer detail, titled «Перевод №N» like its list row:
 * a from → to route header and the fact rows. Transfers are immutable (rule 16)
 * — no actions beyond «Закрыть»; the footer says so.
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
		<FormDialog
			open
			size="sm"
			// The list labels a wallet transfer by its id (it has no served number).
			title={t("wallet.transfer.numberedTitle", {
				number: formatEntityId(transfer.id),
			})}
			subtitle={formatDateTime(transfer.date)}
			tile={recordTile("WalletTransfer")}
			onClose={onClose}
			footer={
				<FormDialogFooter
					variant="close"
					onClose={onClose}
					summary={
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "7px",
								fontSize: 13,
								color: "text.secondary",
							}}
						>
							<InfoOutlinedIcon sx={{ fontSize: 16, color: "info.main" }} />
							{t("wallet.transfer.detailImmutable")}
						</Box>
					}
				/>
			}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					p: "14px 16px",
					mb: "8px",
					bgcolor: designTokens.bgSubtle,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: `${radius.md}px`,
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

			<FactList inset={false}>
				<FactRow label={t("wallet.transfer.amount")}>
					<Box
						component="span"
						sx={{ ...numericSx, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}
					>
						{formatCurrency(transfer.amount)}
						<UzsUnit />
					</Box>
				</FactRow>
				<FactRow label={t("wallet.transfer.date")} figures="proportional">
					{formatDateTime(transfer.date)}
				</FactRow>
				<FactRow label={t("wallet.transfer.createdBy")}>{transfer.createdBy}</FactRow>
				<FactRow label={t("wallet.transfer.note")}>{transfer.note}</FactRow>
			</FactList>
		</FormDialog>
	);
};

export default WalletTransferDetailModal;
