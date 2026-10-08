import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { iconSquareSx } from "components/shared/Buttons/iconSquareSx";
import { designTokens } from "theme";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

import { menuItemSx, menuSlotProps } from "./menuPaper";

/**
 * DSN-1 row-menu item tone — the only way a menu row gets colour (icons are
 * passed uncoloured):
 * - `normal` (default): secondary icon + ink label
 * - `warn`: saffron icon + ink label (a reversible but notable step, e.g. reject)
 * - `archive`: saffron icon + saffron label
 * - `restore`: green icon + green label
 * - `danger`: red icon + red label (delete, terminate)
 */
export type ActionTone = "normal" | "warn" | "archive" | "restore" | "danger";

export interface ActionMenuRow {
	key: string;
	label: string;
	icon: React.ReactNode;
	/** Semantic tone for the DSN-1 menu treatment (see {@link ActionTone}). */
	tone?: ActionTone;
	/** Render a separator line above this row. */
	dividerBefore?: boolean;
	onClick: () => void;
}

interface ActionMenuProps {
	actions: ActionMenuRow[];
	/** Bordered 38px trigger for detail headers; plain icon for table rows (default). */
	bordered?: boolean;
}

const TONE_COLORS: Record<ActionTone, { icon: string; label: string }> = {
	normal: { icon: "text.secondary", label: "text.primary" },
	warn: { icon: designTokens.saffron600, label: "text.primary" },
	archive: { icon: designTokens.saffron600, label: designTokens.saffron700 },
	restore: { icon: "success.main", label: "success.main" },
	danger: { icon: "error.main", label: "error.main" },
};

const ActionMenu: React.FC<ActionMenuProps> = ({ actions, bordered = false }) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const isOpen = Boolean(anchor);

	const openMenu = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		setAnchor(e.currentTarget);
	};

	const closeMenu = () => setAnchor(null);

	const handle = (callback: () => void, e: React.MouseEvent) => {
		e.stopPropagation();
		callback();
		closeMenu();
	};

	return (
		<>
			<IconButton
				size="medium"
				onClick={openMenu}
				aria-label={t("common.actions")}
				sx={bordered ? iconSquareSx : undefined}
			>
				<MoreVertIcon />
			</IconButton>

			<Menu
				anchorEl={anchor}
				open={isOpen}
				onClose={closeMenu}
				onClick={(e) => e.stopPropagation()}
				slotProps={menuSlotProps}
			>
				{actions.map((action) => {
					const { icon: iconColor, label: labelColor } = TONE_COLORS[action.tone ?? "normal"];
					return [
						action.dividerBefore && <Divider key={`${action.key}-divider`} sx={{ my: 0.25 }} />,
						<MenuItem key={action.key} onClick={(e) => handle(action.onClick, e)} sx={menuItemSx}>
							<ListItemIcon sx={{ color: iconColor }}>{action.icon}</ListItemIcon>
							<ListItemText
								primary={action.label}
								sx={{ my: 0 }}
								slotProps={{ primary: { sx: { color: labelColor } } }}
							/>
						</MenuItem>,
					];
				})}
			</Menu>
		</>
	);
};

export default ActionMenu;
