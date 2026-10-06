import { ChipTokenKey } from "theme";

import { SvgIconComponent } from "@mui/icons-material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

/**
 * One presentation per stock-movement / transaction kind, shared by every chip
 * that shows a kind (transaction type badges, product and warehouse «Движения»).
 * Sale / Supply carry the brand hues (refunds are the outlined variant); the
 * other kinds are neutral and told apart by icon + label. Keyed by string: the
 * served `kind` is free-form, unknown kinds fall back to {@link FALLBACK_KIND}.
 */
export interface KindPresentation {
	token: ChipTokenKey;
	icon: SvgIconComponent;
}

export const KIND_PRESENTATION: Record<string, KindPresentation> = {
	Sale: { token: "sale", icon: SellOutlinedIcon },
	Supply: { token: "supply", icon: LocalShippingOutlinedIcon },
	SaleRefund: { token: "saleRefund", icon: UndoOutlinedIcon },
	SupplyRefund: { token: "supplyRefund", icon: UndoOutlinedIcon },
	Refund: { token: "saleRefund", icon: UndoOutlinedIcon },
	Opening: { token: "neutral", icon: Inventory2OutlinedIcon },
	Transfer: { token: "neutral", icon: SwapHorizOutlinedIcon },
	Adjustment: { token: "neutral", icon: TuneOutlinedIcon },
};

export const FALLBACK_KIND: KindPresentation = { token: "neutral", icon: Inventory2OutlinedIcon };

export const kindPresentation = (kind: string): KindPresentation =>
	KIND_PRESENTATION[kind] ?? FALLBACK_KIND;

/** i18n key of a movement kind label (one key family for every surface). */
export const movementKindLabelKey = (kind: string): string => `common.movementKind.${kind}`;
