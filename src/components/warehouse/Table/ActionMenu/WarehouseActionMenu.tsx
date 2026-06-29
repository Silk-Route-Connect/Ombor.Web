import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { TFunction } from "i18next";
import { Warehouse } from "models/warehouse";
import { designTokens } from "theme";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface WarehouseActionHandlers {
	warehouse: Warehouse;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
	onDelete: () => void;
}

/**
 * The warehouse action rows — edit, archive-or-restore, delete — shared by the
 * list row menu and the detail-page header kebab so both stay in lockstep
 * (mirrors buildPartnerActionRows). Delete is reference-gated by the caller
 * (business-rules rule 32): a referenced warehouse routes to the «cannot delete»
 * warning, which offers archiving instead. Colors per the bundle's rmenu: edit
 * neutral, archive saffron, restore success, delete danger.
 */
export function buildWarehouseActionRows(
	t: TFunction,
	{ warehouse, onEdit, onArchive, onRestore, onDelete }: WarehouseActionHandlers,
): ActionMenuRow[] {
	return [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />,
			onClick: onEdit,
		},
		warehouse.isArchived
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

interface WarehouseActionMenuProps extends WarehouseActionHandlers {
	/** Bordered trigger for the detail header; plain icon for table rows. */
	bordered?: boolean;
}

/**
 * Row / header actions for a warehouse, built on the shared {@link ActionMenu}.
 * Never silently undeletable — the caller decides whether delete confirms or
 * warns (business-rules rule 32 / hard rule 5).
 */
export const WarehouseActionMenu: React.FC<WarehouseActionMenuProps> = ({
	bordered = false,
	...handlers
}) => {
	const { t } = useTranslation();
	return <ActionMenu actions={buildWarehouseActionRows(t, handlers)} bordered={bordered} />;
};

export default WarehouseActionMenu;
