import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { designTokens } from "theme";

import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import { Box, Tooltip } from "@mui/material";

/**
 * Compact header indicator (DEC-11) shown while the device is offline or the
 * backend is unreachable — replaces the old full-width banner. Mutations stay
 * blocked until connectivity returns; the tooltip says which is wrong. Renders
 * nothing while connected, so it takes no space in the normal header.
 */
const OfflineIndicator: React.FC = observer(() => {
	const { t } = useTranslation();
	const { connectivityStore } = useStore();

	if (!connectivityStore.isDisconnected) {
		return null;
	}

	const tooltip = connectivityStore.isOffline
		? t("common.offline.deviceTooltip")
		: t("common.offline.backendTooltip");

	return (
		<Tooltip title={tooltip} arrow enterDelay={200}>
			<Box
				role="status"
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: 0.75,
					height: 38,
					px: 1.25,
					borderRadius: 1,
					bgcolor: designTokens.errorBg,
					color: "error.main",
					fontSize: 12.5,
					fontWeight: 600,
					whiteSpace: "nowrap",
				}}
			>
				<CloudOffOutlinedIcon sx={{ fontSize: 17 }} />
				<Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
					{t("common.offline.chip")}
				</Box>
			</Box>
		</Tooltip>
	);
});

export default OfflineIndicator;
