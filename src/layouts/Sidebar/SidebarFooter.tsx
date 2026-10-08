import React from "react";
import { useTranslation } from "react-i18next";
import { PATHS } from "routing/paths";
import { designTokens } from "theme";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { List } from "@mui/material";

import { NavItem } from "../config";
import RailButton from "./RailButton";
import { navListSx } from "./styles";
import TopLevelItem from "./TopLevelItem";

interface SidebarFooterProps {
	expanded: boolean;
	settingsActive: boolean;
	onSettings: () => void;
}

const SETTINGS_ITEM: NavItem = {
	labelKey: "sidebar.settings",
	icon: SettingsOutlinedIcon,
	to: PATHS.settings,
};

/**
 * «Настройки», pinned at the bottom of the panel (pattern 10). Signing out lives
 * in the topbar's avatar menu only, so a stray click at the panel's foot never
 * ends the session.
 */
export default function SidebarFooter({
	expanded,
	settingsActive,
	onSettings,
}: Readonly<SidebarFooterProps>) {
	const { t } = useTranslation();

	return (
		<List
			disablePadding
			sx={{ mt: 1, pt: 1.25, borderTop: 1, borderColor: designTokens.onDarkLine, ...navListSx }}
		>
			{expanded ? (
				<TopLevelItem item={SETTINGS_ITEM} active={settingsActive} onClick={onSettings} />
			) : (
				<RailButton
					label={t(SETTINGS_ITEM.labelKey)}
					icon={SETTINGS_ITEM.icon}
					active={settingsActive}
					onClick={onSettings}
				/>
			)}
		</List>
	);
}
