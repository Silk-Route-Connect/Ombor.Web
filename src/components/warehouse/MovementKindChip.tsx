import React from "react";
import { useTranslation } from "react-i18next";
import { WarehouseMovementKind } from "models/warehouse";
import { chipTokens } from "theme";

import { Box } from "@mui/material";

/**
 * Movement-type chip (WH-24) — one distinct treatment per stock-event kind,
 * sourced from `chipTokens` (no inline `alpha`/per-component colour). Sale=teal /
 * Supply=saffron reuse the transaction-type tokens; Opening is the neutral stone,
 * Refund the teal outline (a reversal), Transfer info-blue, Adjustment
 * warning-amber. Money green/red stays reserved for direction.
 */
// Keyed by string (not the enum) so an unexpected backend kind — e.g. the split
// `SaleRefund` / `SupplyRefund` rather than a collapsed `Refund` — falls back to
// `neutral` instead of crashing (the served `kind` is a free string).
const KIND_TOKEN: Record<string, keyof typeof chipTokens> = {
	Sale: "sale",
	Supply: "supply",
	Opening: "neutral",
	Refund: "saleRefund",
	SaleRefund: "saleRefund",
	SupplyRefund: "supplyRefund",
	Adjustment: "adjustment",
	Transfer: "transfer",
};

export const MovementKindChip: React.FC<{ kind: WarehouseMovementKind }> = ({ kind }) => {
	const { t } = useTranslation();
	const tk = chipTokens[KIND_TOKEN[kind] ?? "neutral"];

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				height: 22,
				px: "9px",
				borderRadius: "999px",
				fontSize: 12,
				fontWeight: 600,
				whiteSpace: "nowrap",
				border: "1px solid",
				bgcolor: tk.bg,
				color: tk.color,
				borderColor: tk.border,
			}}
		>
			{t(`warehouse.movement.${kind}`)}
		</Box>
	);
};

export default MovementKindChip;
