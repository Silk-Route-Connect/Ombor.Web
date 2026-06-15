import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Template } from "models/template";
import { designTokens } from "theme";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

interface TemplateActionsMenuProps {
	template: Template;
	onEdit: (template: Template) => void;
	onDelete: (template: Template) => void;
}

/**
 * Per-row actions menu: Edit · Delete in a ⋮ menu. A template is a mutable basket
 * (not an immutable event), so edit/delete are allowed (mvp-plan §12). The
 * prototype's «Использовать» action is deferred until the redesigned New
 * Sale/Supply screens land.
 */
export const TemplateActionsMenu: React.FC<TemplateActionsMenuProps> = ({
	template,
	onEdit,
	onDelete,
}) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const close = () => setAnchor(null);
	const run = (fn: () => void) => () => {
		close();
		fn();
	};

	return (
		<>
			<IconButton
				onClick={(e) => {
					e.stopPropagation();
					setAnchor(e.currentTarget);
				}}
				aria-label={t("template.actions.label")}
				sx={{ color: designTokens.gray600 }}
			>
				<MoreVertIcon sx={{ fontSize: 20 }} />
			</IconButton>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={close}
				onClick={(e) => e.stopPropagation()}
			>
				<MenuItem onClick={run(() => onEdit(template))}>
					<ListItemIcon>
						<EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
					</ListItemIcon>
					<ListItemText primary={t("common.edit")} />
				</MenuItem>
				<MenuItem onClick={run(() => onDelete(template))}>
					<ListItemIcon>
						<DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
					</ListItemIcon>
					<ListItemText
						primary={t("common.delete")}
						slotProps={{ primary: { sx: { color: "error.main" } } }}
					/>
				</MenuItem>
			</Menu>
		</>
	);
};

export default TemplateActionsMenu;
