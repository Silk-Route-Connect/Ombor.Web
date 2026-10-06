import type { ComponentType } from "react";
import { NotificationKind } from "models/notification";
import { ChipTokenKey } from "theme";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import { SvgIconProps } from "@mui/material";

/**
 * Glyph and tint per alert kind, on the app's colour semantics: overdue is red
 * everywhere (DR-28), low stock amber like the «Мало» pill, today's plan blue.
 */
export const ALERT_META: Record<
	NotificationKind,
	{ icon: ComponentType<SvgIconProps>; token: ChipTokenKey }
> = {
	OverdueReceivables: { icon: RequestQuoteOutlinedIcon, token: "danger" },
	OrdersOverdue: { icon: LocalShippingOutlinedIcon, token: "danger" },
	LowStock: { icon: Inventory2OutlinedIcon, token: "warning" },
	OrdersDueToday: { icon: TodayOutlinedIcon, token: "info" },
};

/** Items shown under an alert; the full list is one click away on the filtered page. */
export const ALERT_ITEMS_SHOWN = 3;
