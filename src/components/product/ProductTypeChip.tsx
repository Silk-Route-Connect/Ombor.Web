import React from "react";
import { useTranslation } from "react-i18next";
import { ProductType } from "models/product";
import { chipTokens } from "theme";

import { Box } from "@mui/material";

/**
 * Product type → chipTokens key (DSN-1): Sale=teal, Supply=saffron — the brand
 * hues that carry transaction type — and All=neutral (type-agnostic, the DS
 * `.chip-neutral`). Replaces the stale info/warning (blue/amber) mapping.
 */
const TYPE_TOKEN: Record<ProductType, keyof typeof chipTokens> = {
	Sale: "sale",
	Supply: "supply",
	All: "neutral",
};

interface ProductTypeChipProps {
	type: ProductType;
	dimmed?: boolean;
}

export const ProductTypeChip: React.FC<ProductTypeChipProps> = ({ type, dimmed }) => {
	const { t } = useTranslation();
	const tk = chipTokens[TYPE_TOKEN[type]];

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
				opacity: dimmed ? 0.55 : 1,
			}}
		>
			{t(`product.type.${type}`)}
		</Box>
	);
};

export default ProductTypeChip;
