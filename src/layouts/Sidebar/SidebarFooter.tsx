import React, { ElementType } from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

import RailButton from "./RailButton";
import { NAV_ICON, navLabelSx, navListSx, topLevelItemSx } from "./styles";

interface SidebarFooterProps {
	expanded: boolean;
	settingsActive: boolean;
	onSettings: () => void;
	onLogout: () => void;
}

function FooterRow({
	label,
	icon: Icon,
	active,
	onClick,
}: Readonly<{ label: string; icon: ElementType; active: boolean; onClick: () => void }>) {
	return (
		<ListItemButton
			onClick={onClick}
			aria-current={active ? "page" : undefined}
			sx={topLevelItemSx(active)}
		>
			<ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
				<Icon sx={{ fontSize: NAV_ICON }} />
			</ListItemIcon>
			<ListItemText primary={label} slotProps={{ primary: { sx: navLabelSx(active) } }} />
		</ListItemButton>
	);
}

/** «Настройки» and «Выход», pinned at the bottom of the panel (pattern 10). */
export default function SidebarFooter({
	expanded,
	settingsActive,
	onSettings,
	onLogout,
}: Readonly<SidebarFooterProps>) {
	const { t } = useTranslation();
	const Row = expanded ? FooterRow : RailButton;

	return (
		<List
			disablePadding
			sx={{ mt: 1, pt: 1.25, borderTop: 1, borderColor: designTokens.onDarkLine, ...navListSx }}
		>
			<Row
				label={t("sidebar.settings")}
				icon={SettingsOutlinedIcon}
				active={settingsActive}
				onClick={onSettings}
			/>
			<Row
				label={t("sidebar.logout")}
				icon={LogoutOutlinedIcon}
				active={false}
				onClick={onLogout}
			/>
		</List>
	);
}
