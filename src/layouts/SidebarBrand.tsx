import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OmborMark from "components/shared/brand/OmborMark";
import TruncatedText from "components/shared/Table/TruncatedText";
import { isPresent } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { getImageFullUrl } from "utils/productUtils";

import MenuIcon from "@mui/icons-material/Menu";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

interface SidebarBrandProps {
	expanded: boolean;
	onToggle: () => void;
}

/**
 * Ombor mark + the business it serves: the organization's own logo (Настройки →
 * Организация) beside its current name. The profile loads quietly — a missing
 * logo is not worth an error toast — and the name falls back to the one in the
 * session until it arrives.
 */
const SidebarBrand: React.FC<SidebarBrandProps> = observer(({ expanded, onToggle }) => {
	const { t } = useTranslation();
	const { authStore, settingsStore } = useStore();
	const [logoFailed, setLogoFailed] = useState(false);

	useEffect(() => {
		void settingsStore.ensureOrganization({ quiet: true });
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
					borderRadius: 1,
					color: "text.secondary",
					flexShrink: 0,
					"&:hover": { bgcolor: "action.hover", color: "text.primary" },
				}}
			>
				<MenuIcon sx={{ fontSize: 20 }} />
			</IconButton>
		</Tooltip>
	);

	if (!expanded) {
		return (
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, pb: 1.5 }}>
				<OmborMark size={34} />
				{toggle}
			</Box>
		);
	}

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, pt: 0.75, pb: 1.75 }}>
			<OmborMark size={34} />
			<Box sx={{ minWidth: 0, flex: 1 }}>
				<Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>Ombor</Typography>
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
									borderRadius: "4px",
									objectFit: "cover",
								}}
							/>
						)}
						<TruncatedText
							// Re-measure the clipping when the logo takes its 22px.
							key={showLogo ? "with-logo" : "name-only"}
							text={businessName}
							maxWidth="100%"
							sx={{ minWidth: 0, fontSize: 11, lineHeight: "20px", color: "text.disabled" }}
						/>
					</Box>
				)}
			</Box>
			{toggle}
		</Box>
	);
});

export default SidebarBrand;
