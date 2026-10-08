import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import IconTile from "components/shared/IconTile/IconTile";
import { CustomContentProps, SnackbarContent, useSnackbar, VariantType } from "notistack";
import { ChipTokenKey, radius } from "theme";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Box, IconButton, Typography } from "@mui/material";

/** Each variant's tile: the chip family it shares with pills, and its glyph. */
const VARIANT_TILE: Record<VariantType, { token: ChipTokenKey; icon: React.ElementType }> = {
	success: { token: "success", icon: CheckCircleOutlineIcon },
	error: { token: "danger", icon: ErrorOutlineIcon },
	warning: { token: "warning", icon: WarningAmberRoundedIcon },
	info: { token: "info", icon: InfoOutlinedIcon },
	default: { token: "neutral", icon: NotificationsNoneOutlinedIcon },
};

/**
 * The body of every toast: a paper card with the variant's tinted icon tile,
 * the message in ink and a close button — the app's own surface instead of
 * notistack's coloured bars. Every variant is an `alert` (see the role below).
 */
export const ToastContent = forwardRef<HTMLDivElement, CustomContentProps>(function ToastContent(
	{ id, message, variant, action, style, className },
	ref,
) {
	const { t } = useTranslation();
	const { closeSnackbar } = useSnackbar();
	const { token, icon: Icon } = VARIANT_TILE[variant];
	const actionNode = typeof action === "function" ? action(id) : action;

	return (
		<SnackbarContent
			ref={ref}
			style={style}
			className={className}
			// «alert» for every variant, as notistack had it: a «status» region that
			// appears already filled is often not read out by NVDA / JAWS.
			role="alert"
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					width: { xs: "100%", sm: "auto" },
					minWidth: { sm: 320 },
					maxWidth: { sm: 440 },
					py: 1.25,
					pl: 1.25,
					pr: 0.75,
					bgcolor: "background.paper",
					color: "text.primary",
					border: 1,
					borderColor: "divider",
					borderRadius: `${radius.md}px`,
					boxShadow: 8,
				}}
			>
				<IconTile icon={<Icon />} token={token} size={32} />
				<Typography sx={{ flex: 1, fontSize: 14, fontWeight: 500, lineHeight: 1.45 }}>
					{message}
				</Typography>
				{actionNode}
				<IconButton
					size="small"
					aria-label={t("common.toast.close")}
					onClick={() => closeSnackbar(id)}
					sx={{ color: "text.secondary", alignSelf: "flex-start" }}
				>
					<CloseIcon sx={{ fontSize: 18 }} />
				</IconButton>
			</Box>
		</SnackbarContent>
	);
});

export default ToastContent;
