import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { TFunction } from "i18next";
import { Partner } from "models/partner";
import { designTokens } from "theme";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface PartnerActionHandlers {
	partner: Partner;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
	onDelete: () => void;
}

/**
 * The partner action rows — edit, archive-or-restore, delete — shared by the
 * list row menu and the detail-page header kebab so both stay in lockstep.
 * Delete is reference-gated by the caller (confirm vs «cannot delete»).
 */
export function buildPartnerActionRows(
	t: TFunction,
	{ partner, onEdit, onArchive, onRestore, onDelete }: PartnerActionHandlers,
): ActionMenuRow[] {
	return [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />,
			onClick: onEdit,
		},
		partner.isArchived
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
		{
			key: "delete",
			label: t("common.delete"),
			tone: "danger",
			dividerBefore: true,
			icon: <DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />,
			onClick: onDelete,
		},
	];
}

interface PartnerActionsMenuProps extends PartnerActionHandlers {
	/** Bordered trigger for the detail header; plain icon for table rows. */
	bordered?: boolean;
}

/**
 * Row / header actions for a partner, built on the shared {@link ActionMenu}
 * (DSN-1 tight padding + separators). Partners are never silently undeletable
 * here — the caller decides whether delete confirms or warns.
 */
export const PartnerActionsMenu: React.FC<PartnerActionsMenuProps> = ({
	bordered = false,
	...handlers
}) => {
	const { t } = useTranslation();
	return <ActionMenu actions={buildPartnerActionRows(t, handlers)} bordered={bordered} />;
};

export default PartnerActionsMenu;
