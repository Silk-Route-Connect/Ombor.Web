import React, { useState } from "react";
import { radius } from "theme";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

/**
 * DSN-1 row-menu item tone:
 * - `normal` (default): secondary-coloured icon + primary label
 * - `warn`: saffron icon (e.g. edit) + primary label
 * - `danger`: red icon + red label (e.g. delete)
 */
export type ActionTone = "normal" | "warn" | "danger";

export interface ActionMenuRow {
	key: string;
	label: string;
	icon: React.ReactNode;
	/** Semantic tone for the DSN-1 menu treatment (see {@link ActionTone}). */
	tone?: ActionTone;
	/** Explicit label colour — overrides the tone's label colour when set. */
	labelColor?: string;
	/** Render a separator line above this row. */
	dividerBefore?: boolean;
	onClick: () => void;
}

interface ActionMenuProps {
	actions: ActionMenuRow[];
}

const iconColorFor = (tone: ActionTone): string =>
	tone === "danger" ? "error.main" : tone === "warn" ? "warning.main" : "text.secondary";

const labelColorFor = (tone: ActionTone): string =>
	tone === "danger" ? "error.main" : "text.primary";

const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
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
			<IconButton size="medium" onClick={openMenu} aria-label="actions">
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
							minWidth: 200,
							borderRadius: `${radius.md}px`,
							border: 1,
							borderColor: "divider",
							boxShadow: 8,
							p: 0.75,
						},
					},
				}}
			>
				{actions.map((action) => {
					const tone = action.tone ?? "normal";
					const iconColor = iconColorFor(tone);
					const labelColor = action.labelColor ?? labelColorFor(tone);
					return [
						action.dividerBefore && <Divider key={`${action.key}-divider`} sx={{ my: 0.5 }} />,
						<MenuItem
							key={action.key}
							onClick={(e) => handle(action.onClick, e)}
							sx={{
								borderRadius: `${radius.sm}px`,
								px: 1.5,
								py: "9px",
								gap: 1.25,
								fontSize: 14,
								"&:hover": { bgcolor: "action.hover" },
							}}
						>
							<ListItemIcon sx={{ minWidth: 0, color: iconColor }}>{action.icon}</ListItemIcon>
							<ListItemText
								primary={action.label}
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
