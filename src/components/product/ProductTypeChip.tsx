import React from "react";
import { useTranslation } from "react-i18next";
import { ProductType } from "models/product";

import { alpha, Chip } from "@mui/material";

/** Soft chip tone per the prototype PRTYPE map. */
const TYPE_COLOR: Record<ProductType, "primary" | "success" | "info"> = {
	All: "primary",
	Sale: "success",
	Supply: "info",
};

interface ProductTypeChipProps {
	type: ProductType;
	dimmed?: boolean;
}

export const ProductTypeChip: React.FC<ProductTypeChipProps> = ({ type, dimmed }) => {
	const { t } = useTranslation();
	const color = TYPE_COLOR[type];

	return (
		<Chip
			label={t(`product.type.${type}`)}
			size="small"
			sx={(theme) => ({
				height: 22,
				fontSize: 12,
				fontWeight: 600,
				bgcolor: alpha(theme.palette[color].main, 0.12),
				color: theme.palette[color].main,
				opacity: dimmed ? 0.55 : 1,
			})}
		/>
	);
};

export default ProductTypeChip;
