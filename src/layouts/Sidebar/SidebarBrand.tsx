import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OmborMark from "components/shared/brand/OmborMark";
import TruncatedText from "components/shared/Table/TruncatedText";
import { isPresent } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { designTokens, radius } from "theme";
import { getImageFullUrl } from "utils/productUtils";

import MenuIcon from "@mui/icons-material/Menu";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

interface SidebarBrandProps {
	expanded: boolean;
	onToggle: () => void;
}

/**
 * Ombor mark + the business it serves: the organization's own logo (Настройки →
 * Организация) beside its current name. The name falls back to the one in the
 * session until the profile arrives; a failed load just keeps that fallback.
 */
const SidebarBrand: React.FC<SidebarBrandProps> = observer(({ expanded, onToggle }) => {
	const { t } = useTranslation();
	const { authStore, settingsStore } = useStore();
	const [logoFailed, setLogoFailed] = useState(false);

	useEffect(() => {
		void settingsStore.ensureOrganization();
	}, [settingsStore]);

	const org = settingsStore.organization;
	const businessName = isPresent(org) ? org.name : authStore.getUser()?.organizationName;
	const logo = isPresent(org) ? getImageFullUrl(org.logoUrl ?? undefined) : undefined;

	useEffect(() => setLogoFailed(false), [logo]);
	const showLogo = Boolean(logo) && !logoFailed;

	// Hamburger lives inside the sidebar (top-right when expanded, under the mark
	// when collapsed) — deliberately not in the topbar.
	const toggle = (
		<Tooltip title={t(expanded ? "sidebar.collapse" : "sidebar.expand")} placement="right" arrow>
			<IconButton
				onClick={onToggle}
				aria-label={t(expanded ? "sidebar.collapse" : "sidebar.expand")}
				sx={{
					width: 38,
					height: 38,
					borderRadius: `${radius.md}px`,
					color: designTokens.onDarkMuted,
					flexShrink: 0,
					"&:hover": { bgcolor: designTokens.onDarkHover, color: "common.white" },
					"&.Mui-focusVisible": { outlineColor: "common.white" },
				}}
			>
				<MenuIcon sx={{ fontSize: 20 }} />
			</IconButton>
		</Tooltip>
	);

	if (!expanded) {
		return (
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, pb: 1.5 }}>
				<OmborMark size={34} variant="reversed" />
				{toggle}
			</Box>
		);
	}

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, pt: 0.75, pb: 1.75 }}>
			<OmborMark size={34} variant="reversed" />
			<Box sx={{ minWidth: 0, flex: 1 }}>
				<Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2, color: "common.white" }}>
					Ombor
				</Typography>
				{businessName && (
					<Box sx={{ display: "flex", alignItems: "center", gap: "6px", mt: "2px", minWidth: 0 }}>
						{showLogo && (
							<Box
								component="img"
								src={logo}
								alt=""
								onError={() => setLogoFailed(true)}
								sx={{
									width: 16,
									height: 16,
									flexShrink: 0,
									borderRadius: `${radius.xs}px`,
									objectFit: "cover",
								}}
							/>
						)}
						<TruncatedText
							// Re-measure the clipping when the logo takes its 22px.
							key={showLogo ? "with-logo" : "name-only"}
							text={businessName}
							maxWidth="100%"
							sx={{
								minWidth: 0,
								fontSize: 11,
								lineHeight: "20px",
								color: designTokens.onDarkMuted,
							}}
						/>
					</Box>
				)}
			</Box>
			{toggle}
		</Box>
	);
});

export default SidebarBrand;
