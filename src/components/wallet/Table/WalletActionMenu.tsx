import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { TFunction } from "i18next";
import { Wallet } from "models/wallet";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface WalletActionHandlers {
	wallet: Wallet;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
	onDelete: () => void;
}

/**
 * The wallet action rows — edit, archive-or-restore, delete — shared by the
 * list row menu and the detail-page kebab (mirrors buildWarehouseActionRows).
 * Delete is always offered; a referenced wallet gets «cannot delete — archive
 * instead» (pattern 19).
 */
export function buildWalletActionRows(
	t: TFunction,
	{ wallet, onEdit, onArchive, onRestore, onDelete }: WalletActionHandlers,
): ActionMenuRow[] {
	return [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" />,
			onClick: onEdit,
		},
		wallet.isArchived
			? {
					key: "restore",
					label: t("common.restore"),
					tone: "restore",
					dividerBefore: true,
					icon: <UnarchiveOutlinedIcon fontSize="small" />,
					onClick: onRestore,
				}
			: {
					key: "archive",
					label: t("common.archive"),
					tone: "archive",
					dividerBefore: true,
					icon: <ArchiveOutlinedIcon fontSize="small" />,
					onClick: onArchive,
				},
		{
			key: "delete",
			label: t("common.delete"),
			tone: "danger",
			dividerBefore: true,
			icon: <DeleteOutlineIcon fontSize="small" />,
			onClick: onDelete,
		},
	];
}

/** Row actions for a wallet on the shared {@link ActionMenu}. */
export const WalletActionMenu: React.FC<WalletActionHandlers> = (handlers) => {
	const { t } = useTranslation();
	return <ActionMenu actions={buildWalletActionRows(t, handlers)} />;
};

export default WalletActionMenu;
