import React from "react";
import { useTranslation } from "react-i18next";
import { chipTokens } from "theme";

import { SvgIconComponent } from "@mui/icons-material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box } from "@mui/material";

/**
 * Product movement / transaction kind → chip appearance. The served `kind` is a
 * free-form string (OpenAPI `ProductMovementDto.kind`) that spans transaction
 * kinds AND warehouse ledger kinds — Sale / Supply / Sale-Refund / Supply-Refund
 * (DSN-1: teal / saffron / outlined refunds) plus Opening / Transfer / Adjustment
 * (neutral). Each kind has its own i18n label (`product.txn.*`); the caller is
 * responsible for splitting a generic «Refund» into the specific refund type.
 */
const TOKEN_BY_KIND: Record<string, keyof typeof chipTokens> = {
	Sale: "sale",
	Supply: "supply",
	SaleRefund: "saleRefund",
	SupplyRefund: "supplyRefund",
	Opening: "neutral",
	Transfer: "neutral",
	Adjustment: "neutral",
};

const ICON_BY_KIND: Record<string, SvgIconComponent> = {
	Sale: SellOutlinedIcon,
	Supply: LocalShippingOutlinedIcon,
	SaleRefund: UndoOutlinedIcon,
	SupplyRefund: UndoOutlinedIcon,
	Opening: Inventory2OutlinedIcon,
	Transfer: SwapHorizOutlinedIcon,
	Adjustment: TuneOutlinedIcon,
};

export const TransactionKindChip: React.FC<{ kind: string }> = ({ kind }) => {
	const { t } = useTranslation();
	// Fall back to the neutral chip for any kind the maps don't cover (defensive
	// against served kinds beyond the known set — never crash, never leak colours).
	const tk = chipTokens[TOKEN_BY_KIND[kind] ?? "neutral"];
	const Icon = ICON_BY_KIND[kind] ?? Inventory2OutlinedIcon;

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "5px",
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
			<Icon sx={{ fontSize: 13 }} />
			{t(`product.txn.${kind}`)}
		</Box>
	);
};

export default TransactionKindChip;
