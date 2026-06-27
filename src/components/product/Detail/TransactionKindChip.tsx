import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionType } from "models/transaction";
import { chipTokens } from "theme";

import { SvgIconComponent } from "@mui/icons-material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box } from "@mui/material";

/** Transaction type → chipTokens key (DSN-1: teal=Sale, saffron=Supply, refunds outlined). */
const TYPE_TOKEN: Record<TransactionType, keyof typeof chipTokens> = {
	Sale: "sale",
	Supply: "supply",
	SaleRefund: "saleRefund",
	SupplyRefund: "supplyRefund",
};

/** Type → leading icon, matched by meaning (sell / inbound supply / reversal). */
const TYPE_ICON: Record<TransactionType, SvgIconComponent> = {
	Sale: SellOutlinedIcon,
	Supply: LocalShippingOutlinedIcon,
	SaleRefund: UndoOutlinedIcon,
	SupplyRefund: UndoOutlinedIcon,
};

export const TransactionKindChip: React.FC<{ kind: TransactionType }> = ({ kind }) => {
	const { t } = useTranslation();
	const tk = chipTokens[TYPE_TOKEN[kind]];
	const Icon = TYPE_ICON[kind];

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
