import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { designTokens, radius } from "theme";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

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
				sx={
					bordered
						? {
								width: 38,
								height: 38,
								borderRadius: `${radius.sm}px`,
								border: "1px solid",
								borderColor: designTokens.gray300,
								color: designTokens.gray600,
							}
						: undefined
				}
			>
				<MoreVertIcon />
			</IconButton>

			<Menu
				anchorEl={anchor}
				open={isOpen}
				onClose={closeMenu}
				onClick={(e) => e.stopPropagation()}
				slotProps={{
					paper: {
						// DSN-1 menu surface: hairline, soft elevation, rounded, padded.
						sx: {
							minWidth: 176,
							borderRadius: `${radius.md}px`,
							border: 1,
							borderColor: "divider",
							boxShadow: 8,
							p: 0.5,
						},
					},
					// Drop MUI's default 8px MenuList padding so the only gap between the
					// menu border and the items is the 4px paper padding (matches the
					// design's tight spacing).
					list: { sx: { py: 0 } },
				}}
			>
				{actions.map((action) => {
					const { icon: iconColor, label: labelColor } = TONE_COLORS[action.tone ?? "normal"];
					return [
						action.dividerBefore && <Divider key={`${action.key}-divider`} sx={{ my: 0.25 }} />,
						<MenuItem
							key={action.key}
							onClick={(e) => handle(action.onClick, e)}
							sx={{
								borderRadius: `${radius.sm}px`,
								px: 1.25,
								py: "4px",
								gap: 1,
								fontSize: 14,
								// MUI's MenuItem forces `.MuiListItemIcon-root { min-width: 36px }`,
								// which left ~16px of dead space beside the 20px glyph. Collapse the
								// icon box to its content so the gap above is the *only* icon↔text space.
								"& .MuiListItemIcon-root": { minWidth: 0 },
								"&:hover": { bgcolor: "action.hover" },
							}}
						>
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
