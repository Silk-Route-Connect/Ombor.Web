import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { Warehouse } from "models/warehouse";
import { designTokens } from "theme";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface WarehouseActionMenuProps {
	warehouse: Warehouse;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
}

/**
 * Row actions for a warehouse: edit, plus archive or restore depending on state.
 * Warehouses are archive-only — never hard-deleted (business-rules rule 29).
 * Colors per the bundle's rmenu: edit neutral, archive saffron, restore success.
 */
export const WarehouseActionMenu: React.FC<WarehouseActionMenuProps> = ({
	warehouse,
	onEdit,
	onArchive,
	onRestore,
}) => {
	const { t } = useTranslation();

	const actions: ActionMenuRow[] = [
		warehouse.isArchived
			? {
					key: "restore",
					label: t("common.restore"),
					labelColor: "success.main",
					icon: <UnarchiveOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />,
					onClick: onRestore,
				}
			: {
					key: "edit",
					label: t("common.edit"),
					icon: <EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />,
					onClick: onEdit,
				},
	];

	if (!warehouse.isArchived) {
		actions.push({
			key: "archive",
			label: t("common.archive"),
			labelColor: designTokens.saffron700,
			dividerBefore: true,
			icon: <ArchiveOutlinedIcon fontSize="small" sx={{ color: designTokens.saffron600 }} />,
			onClick: onArchive,
		});
	}

	return <ActionMenu actions={actions} />;
};

export default WarehouseActionMenu;
