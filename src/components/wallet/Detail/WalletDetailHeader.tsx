import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { WalletTypeBadge } from "components/wallet/WalletPresentation";
import { Wallet } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { Box, ButtonBase, Typography } from "@mui/material";

interface WalletDetailHeaderProps {
	wallet: Wallet;
	onBack: () => void;
	onNewTransfer: () => void;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
}

/**
 * Wallet detail header per the bundle: bordered back chevron, title with the
 * type + archive badges, the «Начальный остаток · создана» meta row, and either
 * the shared ⋮ actions menu (edit / archive) or a primary «Восстановить» when
 * archived (locked pattern 2). The ⋮ uses the shared bordered `ActionMenu`
 * (kills the hand-rolled menu + hardcoded aria-label, CR A-FE-12).
 */
export const WalletDetailHeader: React.FC<WalletDetailHeaderProps> = ({
	wallet,
	onBack,
	onNewTransfer,
	onEdit,
	onArchive,
	onRestore,
}) => {
	const { t } = useTranslation();

	const actions: ActionMenuRow[] = [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />,
			onClick: onEdit,
		},
		{
			key: "archive",
			label: t("common.archive"),
			labelColor: designTokens.saffron700,
			dividerBefore: true,
			icon: <ArchiveOutlinedIcon fontSize="small" sx={{ color: designTokens.saffron600 }} />,
			onClick: onArchive,
		},
	];

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "space-between",
				gap: "20px",
				mb: "22px",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
				<ButtonBase
					onClick={onBack}
					aria-label={t("wallet.detail.back")}
					sx={{
						width: 40,
						height: 40,
						flex: "0 0 auto",
						borderRadius: "8px",
						border: "1px solid",
						borderColor: designTokens.gray300,
						bgcolor: "background.paper",
						color: designTokens.gray700,
						"&:hover": { bgcolor: designTokens.gray50, borderColor: designTokens.gray400 },
					}}
				>
					<ChevronLeftIcon sx={{ fontSize: 20 }} />
				</ButtonBase>

				<Box sx={{ minWidth: 0 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
						<Typography
							component="h1"
							sx={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}
						>
							{wallet.name}
						</Typography>
						<WalletTypeBadge type={wallet.type} />
						{wallet.isArchived && <ArchivedBadge />}
					</Box>
					<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "6px" }}>
						{t("wallet.detail.openingLabel")}{" "}
						<Box component="span" sx={numericSx}>
							{formatCurrency(wallet.openingBalance)}
						</Box>{" "}
						UZS · {t("wallet.detail.createdLabel")} {formatDate(wallet.createdAt)} ·{" "}
						{wallet.createdBy}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: "0 0 auto" }}>
				{wallet.isArchived ? (
					<PrimaryButton icon={<UnarchiveOutlinedIcon />} onClick={onRestore}>
						{t("common.restore")}
					</PrimaryButton>
				) : (
					<>
						{/* Child-event create in the primaryAction slot (WAL-13) — reachable
						    from both tabs, next to the ⋮ menu (Order-detail pattern). */}
						<PrimaryButton icon={<AddIcon />} onClick={onNewTransfer}>
							{t("wallet.transfer.action")}
						</PrimaryButton>
						<ActionMenu bordered actions={actions} />
					</>
				)}
			</Box>
		</Box>
	);
};

export default WalletDetailHeader;
