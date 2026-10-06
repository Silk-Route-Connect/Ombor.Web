import React from "react";
import { useTranslation } from "react-i18next";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

import { NavItem } from "../config";
import { NAV_CHEVRON, NAV_ICON, navLabelSx, topLevelItemSx } from "./styles";

interface TopLevelItemProps {
	item: NavItem;
	active: boolean;
	expanded?: boolean;
	onClick: () => void;
}

/** A top-level entry of the expanded panel: a direct link or a group header. */
export default function TopLevelItem({
	item,
	active,
	expanded,
	onClick,
}: Readonly<TopLevelItemProps>) {
	const { t } = useTranslation();
	const Icon = item.icon;
	// A leaf that is the open page is selected; a group only turns white while it
	// holds the open page — being expanded alone does not make it look current.
	const selected = active && !item.children;

	return (
		<ListItemButton
			onClick={onClick}
			aria-current={selected ? "page" : undefined}
			sx={topLevelItemSx(selected, active)}
		>
			<ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
				<Icon sx={{ fontSize: NAV_ICON }} />
			</ListItemIcon>
			<ListItemText
				primary={t(item.labelKey)}
				slotProps={{ primary: { sx: navLabelSx(active) } }}
			/>
			{item.children &&
				(expanded ? (
					<ExpandLessIcon sx={{ fontSize: NAV_CHEVRON, opacity: 0.6 }} />
				) : (
					<ExpandMoreIcon sx={{ fontSize: NAV_CHEVRON, opacity: 0.6 }} />
				))}
		</ListItemButton>
	);
}
