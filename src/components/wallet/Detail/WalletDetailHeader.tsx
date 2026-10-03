import React from "react";
import { useTranslation } from "react-i18next";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import MetaDot from "components/shared/Detail/MetaDot";
import UzsUnit from "components/shared/Money/UzsUnit";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { WalletTypeBadge } from "components/wallet/WalletPresentation";
import { Wallet } from "models/wallet";
import { PATHS } from "routing/paths";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { Box } from "@mui/material";

interface WalletDetailHeaderProps {
	wallet: Wallet;
	onNewTransfer: () => void;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
}

/**
 * Wallet detail header on the shared `DetailPageHeader`: name-only title, the type
 * badge and «Начальный остаток · создана» in the meta line, the ⋮ menu (edit /
 * archive), and one primary action — «Новый перевод», or «Восстановить» when
 * archived (locked pattern 2).
 */
export const WalletDetailHeader: React.FC<WalletDetailHeaderProps> = ({
	wallet,
	onNewTransfer,
	onEdit,
	onArchive,
	onRestore,
}) => {
	const { t } = useTranslation();

	const actions: ActionMenuRow[] = wallet.isArchived
		? []
		: [
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

	const primaryAction = wallet.isArchived ? (
		<PrimaryButton icon={<UnarchiveOutlinedIcon />} onClick={onRestore}>
			{t("common.restore")}
		</PrimaryButton>
	) : (
		<PrimaryButton icon={<AddIcon />} onClick={onNewTransfer}>
			{t("wallet.transfer.action")}
		</PrimaryButton>
	);

	return (
		<DetailPageHeader
			backTo={PATHS.wallets}
			title={wallet.name}
			isArchived={wallet.isArchived}
			actions={actions}
			primaryAction={primaryAction}
			meta={
				<>
					<WalletTypeBadge type={wallet.type} />
					<Box component="span">
						{t("wallet.detail.openingLabel")}{" "}
						<Box component="span" sx={numericSx}>
							{formatCurrency(wallet.openingBalance)}
						</Box>
						<UzsUnit />
					</Box>
					<MetaDot />
					<Box component="span">
						{t("wallet.detail.createdLabel")} {formatDate(wallet.createdAt)}
						{wallet.createdBy ? ` · ${wallet.createdBy}` : ""}
					</Box>
				</>
			}
		/>
	);
};

export default WalletDetailHeader;
