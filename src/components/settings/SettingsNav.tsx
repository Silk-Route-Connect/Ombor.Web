import React from "react";
import { designTokens } from "theme";

import { Box } from "@mui/material";

export type SettingsSectionDef = {
	key: string;
	label: string;
	icon: React.ReactNode;
};

interface Props {
	sections: SettingsSectionDef[];
	activeKey: string;
	onJump: (key: string) => void;
}

/**
 * Sticky left section nav (the bundle's `.settings-nav`): one link per section,
 * highlighted by the page's scroll-spy. Click smooth-scrolls to the section.
 */
const SettingsNav: React.FC<Props> = ({ sections, activeKey, onJump }) => (
	<Box
		component="nav"
		sx={{
			display: { xs: "none", md: "flex" },
			flexDirection: "column",
			gap: "2px",
			position: "sticky",
			top: 0,
			alignSelf: "start",
		}}
	>
		{sections.map((s) => {
			const on = s.key === activeKey;
			return (
				<Box
					key={s.key}
					onClick={() => onJump(s.key)}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "11px",
						p: "10px 13px",
						borderRadius: "8px",
						fontSize: 14,
						fontWeight: on ? 600 : 500,
						cursor: "pointer",
						color: on ? "primary.main" : "text.secondary",
						bgcolor: on ? designTokens.primarySoft : "transparent",
						transition: "background .14s, color .14s",
						"&:hover": on ? {} : { bgcolor: designTokens.gray100, color: designTokens.gray700 },
						"& .set-nav-ic": {
							color: on ? "primary.main" : "text.disabled",
							display: "inline-flex",
						},
					}}
				>
					<Box className="set-nav-ic">{s.icon}</Box>
					{s.label}
				</Box>
			);
		})}
	</Box>
);

export default SettingsNav;
