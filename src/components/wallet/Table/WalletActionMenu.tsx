import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { Wallet } from "models/wallet";
import { designTokens } from "theme";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface WalletActionMenuProps {
	wallet: Wallet;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
}

/**
 * Row actions for a wallet: edit, plus archive or restore depending on state.
 * Wallets are archive-only — never hard-deleted (business-rules rule 29).
 * Colors per the bundle's rmenu: edit neutral, archive saffron, restore success.
 */
export const WalletActionMenu: React.FC<WalletActionMenuProps> = ({
	wallet,
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
		wallet.isArchived
			? {
					key: "restore",
					label: t("common.restore"),
					labelColor: "success.main",
					dividerBefore: true,
					icon: <UnarchiveOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />,
					onClick: onRestore,
				}
			: {
					key: "archive",
					label: t("common.archive"),
					labelColor: designTokens.saffron700,
					dividerBefore: true,
					icon: <ArchiveOutlinedIcon fontSize="small" sx={{ color: designTokens.saffron600 }} />,
					onClick: onArchive,
				},
	];

	return <ActionMenu actions={actions} />;
};

export default WalletActionMenu;
