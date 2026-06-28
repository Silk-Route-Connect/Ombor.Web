import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { Partner } from "models/partner";
import { designTokens } from "theme";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface PartnerActionsMenuProps {
	partner: Partner;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
	onDelete: () => void;
	/** Bordered trigger for the detail header; plain icon for table rows. */
	bordered?: boolean;
}

/**
 * Row / header actions for a partner: edit, archive-or-restore, delete. Built on
 * the shared {@link ActionMenu} (DSN-1 tight padding + separators). Delete is
 * reference-gated by the caller (confirm vs «cannot delete»); partners are never
 * silently undeletable here.
 */
export const PartnerActionsMenu: React.FC<PartnerActionsMenuProps> = ({
	partner,
	onEdit,
	onArchive,
	onRestore,
	onDelete,
	bordered = false,
}) => {
	const { t } = useTranslation();

	const actions: ActionMenuRow[] = [
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

	return <ActionMenu actions={actions} bordered={bordered} />;
};

export default PartnerActionsMenu;
