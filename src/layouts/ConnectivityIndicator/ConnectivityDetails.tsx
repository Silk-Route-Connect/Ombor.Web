import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import Callout from "components/shared/Callout/Callout";
import { FactList, FactRow } from "components/shared/Detail/FactRow";
import IconTile from "components/shared/IconTile/IconTile";
import { useNow } from "hooks/shared/useNow";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { designTokens } from "theme";

import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, CircularProgress, Typography } from "@mui/material";

import { lastReachableText, nextCheckText } from "./detailsText";
import { ProblemStatus, STATUS_PRESENTATION } from "./presentation";

interface DetailsProps {
	status: ProblemStatus;
	/** Id for the heading — the popover is labelled by it. */
	titleId: string;
}

/**
 * The connection pill's popover: what is wrong, what it means for the user
 * (nothing saves, figures may be stale), when the server last answered, when the
 * next automatic check runs, and «Проверить сейчас».
 */
export const ConnectivityDetails: React.FC<DetailsProps> = observer(({ status, titleId }) => {
	const { t } = useTranslation();
	const { connectivityStore: store } = useStore();
	const now = useNow();
	const { icon: Icon, token, labelKey } = STATUS_PRESENTATION[status];

	return (
		<Box sx={{ width: 360, maxWidth: "calc(100vw - 32px)" }}>
			<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2, pb: 1.5 }}>
				<IconTile icon={<Icon />} token={token} size={36} />
				<Box sx={{ minWidth: 0 }}>
					<Typography
						id={titleId}
						component="h2"
						sx={{ fontSize: 15, fontWeight: 600, lineHeight: "22px" }}
					>
						{t(labelKey)}
					</Typography>
					<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
						{t(`common.connectivity.${status}.body`)}
					</Typography>
				</Box>
			</Box>
			<Box sx={{ px: 2 }}>
				<Callout tone="warning">{t("common.connectivity.consequences")}</Callout>
			</Box>
			<Box sx={{ py: 0.5 }}>
				<FactList>
					<FactRow label={t("common.connectivity.lastReachable")} figures="proportional">
						{lastReachableText(t, store.lastReachableAt, now)}
					</FactRow>
					<FactRow label={t("common.connectivity.nextCheck")} figures="proportional">
						{nextCheckText(t, status, store.isChecking, store.nextCheckAt, now)}
					</FactRow>
				</FactList>
			</Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-end",
					px: 2,
					py: 1.5,
					borderTop: 1,
					borderColor: "divider",
					bgcolor: designTokens.bgSubtle,
				}}
			>
				<GhostButton
					icon={store.isChecking ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
					aria-busy={store.isChecking}
					onClick={() => void store.checkNow()}
				>
					{t("common.connectivity.checkNow")}
				</GhostButton>
			</Box>
		</Box>
	);
});

export default ConnectivityDetails;
