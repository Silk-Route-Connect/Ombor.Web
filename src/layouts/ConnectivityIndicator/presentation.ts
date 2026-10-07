import type { ComponentType } from "react";
import type { ConnectivityStatus } from "stores/connectivityTypes";
import { ChipTokenKey } from "theme";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import WifiOffOutlinedIcon from "@mui/icons-material/WifiOffOutlined";
import type { SvgIconProps } from "@mui/material";

/** Every status the header shows something for. */
export type ShownStatus = Exclude<ConnectivityStatus, "connected">;

/** A problem the user can open for details and «Проверить сейчас». */
export type ProblemStatus = Exclude<ShownStatus, "restored">;

export const isProblem = (status: ConnectivityStatus): status is ProblemStatus =>
	status === "offline" || status === "backendDown";

interface StatusPresentation {
	/** i18n key of the pill label — also its accessible name. */
	labelKey: string;
	/** Chip family of the pill, so it reads like every other status pill. */
	token: ChipTokenKey;
	/** Palette colour of the status dot. */
	dot: string;
	icon: ComponentType<SvgIconProps>;
}

export const STATUS_PRESENTATION: Record<ShownStatus, StatusPresentation> = {
	backendDown: {
		labelKey: "common.connectivity.backendDown.label",
		token: "danger",
		dot: "error.main",
		icon: CloudOffOutlinedIcon,
	},
	offline: {
		labelKey: "common.connectivity.offline.label",
		token: "danger",
		dot: "error.main",
		icon: WifiOffOutlinedIcon,
	},
	restored: {
		labelKey: "common.connectivity.restored",
		token: "success",
		dot: "success.main",
		icon: CheckCircleRoundedIcon,
	},
};

/** Off screen but read out — the polite live region that announces each change. */
export const visuallyHiddenSx = {
	position: "absolute",
	width: "1px",
	height: "1px",
	padding: 0,
	margin: "-1px",
	overflow: "hidden",
	clip: "rect(0 0 0 0)",
	whiteSpace: "nowrap",
	border: 0,
} as const;
